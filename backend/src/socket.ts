import type { Server as HttpServer } from 'http';
import { Server as IOServer, type Socket as IOSocket } from 'socket.io';
/** Socket.IO doesn't re-export this from the package entry, so we declare a local alias.
 *  Matches the upstream `DefaultEventsMap` shape — handler args are intentionally `any`
 *  so individual `socket.on('event', (a, b, …) => …)` handlers can use their own argument
 *  types without being constrained by a global event map. */
type DefaultEventsMap = Record<string, (...args: any[]) => void>; // eslint-disable-line @typescript-eslint/no-explicit-any
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';
import { config } from './config/index.js';
import { Job } from './models/Job.js';
import { Message } from './models/Message.js';
import { User } from './models/User.js';
import type { JwtPayload } from '@ats-saas/shared';

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || 'default-message-secret-key';

function encryptMessage(plain: string): string {
  return CryptoJS.AES.encrypt(plain, ENCRYPTION_KEY).toString();
}

type SocketUser = {
  userId: string;
  email: string;
  role: 'admin' | 'recruiter' | 'candidate';
  name: string;
};

type SocketData = {
  user?: SocketUser;
  rooms?: Set<string>;
};

type Socket = IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

type AckHandler<T = unknown> = (response: { ok: boolean; error?: string; data?: T }) => void;

/** Pull and verify a JWT from the socket handshake (auth.token preferred, Authorization header fallback). */
function extractAndVerifyToken(socket: Socket): JwtPayload | null {
  const authHeader = (socket.handshake.headers.authorization as string | undefined) ?? '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const tokenFromAuth = (socket.handshake.auth as { token?: string } | undefined)?.token;
  const token = tokenFromAuth || tokenFromHeader;
  if (!token) return null;

  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the user can read/write the chat for `jobId`.
 *
 * Admin: always.
 * Recruiter: must have an *accepted* assignment for this job.
 */
async function userHasJobAccess(user: SocketUser, jobId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(jobId)) return false;
  if (user.role === 'admin') return true;
  const job = await Job.findOne({
    _id: new mongoose.Types.ObjectId(jobId),
    recruiterAssignments: {
      $elemMatch: {
        recruiterId: new mongoose.Types.ObjectId(user.userId),
        status: 'accepted',
      },
    },
  })
    .select('_id')
    .lean();
  return !!job;
}

export function attachSocketIo(
  httpServer: HttpServer
): IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData> {
  const io = new IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer, {
    cors: {
      origin: config.frontend.origins,
      credentials: true,
    },
    // Defaults are sane; tweak ping for snappier disconnect detection.
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  // Track who is in each job room: jobId → (userId → presenceInfo)
  const presenceByJob = new Map<string, Map<string, { id: string; name: string; email: string }>>();

  /** Recompute presence list for a job and broadcast it. */
  function broadcastPresence(jobId: string) {
    const room = presenceByJob.get(jobId);
    const list = room ? Array.from(room.values()) : [];
    io.to(`job:${jobId}`).emit('online_users', list);
  }

  /** Add the user to the presence map for this job and emit presence. */
  function addPresence(jobId: string, user: SocketUser) {
    if (!presenceByJob.has(jobId)) presenceByJob.set(jobId, new Map());
    presenceByJob.get(jobId)!.set(user.userId, {
      id: user.userId,
      name: user.name,
      email: user.email,
    });
    broadcastPresence(jobId);
  }

  /** Remove a user from a single job's presence map and emit if changed. */
  function removePresence(jobId: string, userId: string) {
    const room = presenceByJob.get(jobId);
    if (!room) return;
    if (room.delete(userId)) {
      if (room.size === 0) presenceByJob.delete(jobId);
      broadcastPresence(jobId);
    }
  }

  // ===== Authentication middleware =====
  io.use(async (socket, next) => {
    const payload = extractAndVerifyToken(socket);
    if (!payload?.userId) {
      return next(new Error('Authentication required'));
    }

    // Resolve real display name. If the JWT already carried it (new tokens do),
    // use that; otherwise fetch from DB so chat never shows raw emails.
    let name = payload.name;
    if (!name) {
      const dbUser = await User.findById(payload.userId).select('name').lean();
      name = dbUser?.name ?? payload.email ?? 'User';
    }

    socket.data.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name,
    };
    socket.data.rooms = new Set<string>();
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // ---- join_room ----
    socket.on(
      'join_room',
      async ({ jobId }: { jobId?: string }, ack?: AckHandler) => {
        try {
          if (!jobId) {
            ack?.({ ok: false, error: 'jobId is required' });
            return;
          }
          const allowed = await userHasJobAccess(user, jobId);
          if (!allowed) {
            ack?.({ ok: false, error: 'You do not have access to this chat' });
            return;
          }

          const room = `job:${jobId}`;
          await socket.join(room);
          socket.data.rooms!.add(jobId);
          addPresence(jobId, user);

          ack?.({ ok: true });
        } catch (err) {
          console.error('[socket] join_room failed', err);
          ack?.({ ok: false, error: 'Failed to join chat' });
        }
      }
    );

    // ---- leave_room ----
    socket.on('leave_room', ({ jobId }: { jobId?: string }, ack?: AckHandler) => {
      try {
        if (!jobId) return ack?.({ ok: false, error: 'jobId is required' });
        const room = `job:${jobId}`;
        socket.leave(room);
        socket.data.rooms!.delete(jobId);
        removePresence(jobId, user.userId);
        ack?.({ ok: true });
      } catch (err) {
        console.error('[socket] leave_room failed', err);
        ack?.({ ok: false, error: 'Failed to leave chat' });
      }
    });

    // ---- send_message ----
    socket.on(
      'send_message',
      async (
        { jobId, message, clientId }: { jobId?: string; message?: string; clientId?: string },
        ack?: AckHandler<{ id: string; clientId?: string }>
      ) => {
        try {
          if (!jobId || !mongoose.isValidObjectId(jobId)) {
            ack?.({ ok: false, error: 'Invalid jobId' });
            return;
          }
          if (!message || !message.trim()) {
            ack?.({ ok: false, error: 'Message is empty' });
            return;
          }
          const allowed = await userHasJobAccess(user, jobId);
          if (!allowed) {
            ack?.({ ok: false, error: 'You do not have access to this chat' });
            return;
          }

          const trimmed = message.trim();
          const doc = await Message.create({
            jobId: new mongoose.Types.ObjectId(jobId),
            senderId: new mongoose.Types.ObjectId(user.userId),
            senderName: user.name,
            encryptedMessage: encryptMessage(trimmed),
          });

          const payload = {
            id: doc._id.toString(),
            jobId,
            senderId: user.userId,
            senderName: user.name,
            message: trimmed,
            createdAt: doc.createdAt.toISOString(),
            clientId,
          };

          io.to(`job:${jobId}`).emit('receive_message', payload);
          ack?.({ ok: true, data: { id: payload.id, clientId } });
        } catch (err) {
          console.error('[socket] send_message failed', err);
          ack?.({ ok: false, error: 'Failed to send message' });
        }
      }
    );

    // ---- delete_message ----
    socket.on(
      'delete_message',
      async (
        { jobId, messageId }: { jobId?: string; messageId?: string },
        ack?: AckHandler
      ) => {
        try {
          if (!jobId || !mongoose.isValidObjectId(jobId)) {
            return ack?.({ ok: false, error: 'Invalid jobId' });
          }
          if (!messageId || !mongoose.isValidObjectId(messageId)) {
            return ack?.({ ok: false, error: 'Invalid messageId' });
          }
          const allowed = await userHasJobAccess(user, jobId);
          if (!allowed) return ack?.({ ok: false, error: 'No access to this chat' });

          const message = await Message.findById(messageId);
          if (!message) return ack?.({ ok: false, error: 'Message not found' });

          const isOwner = message.senderId.toString() === user.userId;
          const isAdmin = user.role === 'admin';
          if (!isOwner && !isAdmin) {
            return ack?.({ ok: false, error: 'You can only delete your own messages' });
          }

          await Message.findByIdAndDelete(messageId);
          io.to(`job:${jobId}`).emit('message_deleted', { jobId, messageId });
          ack?.({ ok: true });
        } catch (err) {
          console.error('[socket] delete_message failed', err);
          ack?.({ ok: false, error: 'Failed to delete message' });
        }
      }
    );

    // ---- disconnect cleanup ----
    socket.on('disconnect', () => {
      socket.data.rooms?.forEach((jobId: string) => removePresence(jobId, user.userId));
    });
  });

  return io;
}
