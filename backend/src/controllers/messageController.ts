 import type { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Job } from '../models/Job.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import type { ApiResponse } from '@ats-saas/shared';

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || 'default-message-secret-key';

function encryptMessage(plain: string): string {
  return CryptoJS.AES.encrypt(plain, ENCRYPTION_KEY).toString();
}

export async function sendSystemMessage(jobId: string, recruiterName: string): Promise<void> {
  const job = await Job.findById(jobId).select('title companyName').lean();
  if (!job) return;

  const messageText = `Hi ${recruiterName}, you have been officially assigned to the "${job.title}" position at ${job.companyName}. 

We’re excited to have you on board! You can now start submitting candidates and collaborating with the team here. If you have any questions about the requirements or salary structure, feel free to drop a message.

Best regards,
Admin Team`;

  const encryptedMessage = encryptMessage(messageText);

  await Message.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    senderId: new mongoose.Types.ObjectId('000000000000000000000000'), // System ID
    senderName: 'Admin Team',
    encryptedMessage,
  });
}

function decryptMessage(cipherText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || '';
  } catch {
    return '';
  }
}

async function assertUserHasAccess(jobId: string, user: { userId: string; role?: string }): Promise<void> {
  if (user.role === 'admin') return;

  const job = await Job.findOne({
    _id: new mongoose.Types.ObjectId(jobId),
    recruiterAssignments: {
      $elemMatch: {
        recruiterId: new mongoose.Types.ObjectId(user.userId),
        status: 'accepted'
      }
    }
  })
    .select('_id')
    .lean();

  if (!job) {
    throw new AppError(403, 'You do not have active access to this chat');
  }
}

type MessageResponseItem = {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  message: string;
  encryptedMessage: string;
  createdAt: string;
};

export const listMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.query as { jobId?: string };
  const user = req.user;

  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new AppError(400, 'jobId is required');
  }
  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  await assertUserHasAccess(jobId, user);

  const docs = await Message.find({ jobId: new mongoose.Types.ObjectId(jobId) })
    .sort({ createdAt: 1 })
    .lean();

  const items: MessageResponseItem[] = docs.map((m) => ({
    id: m._id.toString(),
    jobId: m.jobId.toString(),
    senderId: m.senderId.toString(),
    senderName: m.senderName,
    message: decryptMessage(m.encryptedMessage),
    encryptedMessage: m.encryptedMessage,
    createdAt: m.createdAt.toISOString(),
  }));

  res.json({
    success: true,
    data: items,
  } satisfies ApiResponse<MessageResponseItem[]>);
});

export const createMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId, message } = req.body as { jobId?: string; message?: string };
  const user = req.user;

  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new AppError(400, 'jobId is required');
  }
  if (!message || !message.trim()) {
    throw new AppError(400, 'Message is required');
  }
  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  await assertUserHasAccess(jobId, user);

  const encryptedMessage = encryptMessage(message.trim());
  const senderName = (user as { name?: string; email?: string }).name || user.email || 'User';

  const doc = await Message.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    senderId: new mongoose.Types.ObjectId(user.userId),
    senderName,
    encryptedMessage,
  });

  const item: MessageResponseItem = {
    id: doc._id.toString(),
    jobId: doc.jobId.toString(),
    senderId: doc.senderId.toString(),
    senderName: doc.senderName,
    message,
    encryptedMessage,
    createdAt: doc.createdAt.toISOString(),
  };

  res.status(201).json({
    success: true,
    data: item,
  } satisfies ApiResponse<MessageResponseItem>);
});

export const listAssignedJobs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  const query: any = {};
  if (user.role !== 'admin') {
    query.recruiterAssignments = {
      $elemMatch: {
        recruiterId: new mongoose.Types.ObjectId(user.userId),
        status: 'accepted'
      }
    };
  }

  const jobs = await Job.find(query)
    .select('_id title companyName companyLogo location recruiterIds recruiterAssignments')
    .populate('recruiterIds', 'name email')
    .sort({ updatedAt: -1 })
    .lean();

  const jobIds = jobs.map((j) => j._id);
  const latestByJob = jobIds.length
    ? await Message.aggregate<{ _id: mongoose.Types.ObjectId; lastMessageAt: Date; totalMessages: number }>([
      { $match: { jobId: { $in: jobIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$jobId',
          lastMessageAt: { $first: '$createdAt' },
          totalMessages: { $sum: 1 },
        },
      },
    ])
    : [];
  const latestMap = new Map(
    latestByJob.map((item) => [
      item._id.toString(),
      {
        lastMessageAt: item.lastMessageAt?.toISOString?.() ?? null,
        totalMessages: item.totalMessages ?? 0,
      },
    ])
  );

  const items = jobs.map((j) => ({
    id: j._id.toString(),
    title: j.title,
    companyName: (j as any).companyName ?? '',
    companyLogo: (j as any).companyLogo ?? '',
    location: (j as any).location ?? '',
    lastMessageAt: latestMap.get(j._id.toString())?.lastMessageAt ?? null,
    totalMessages: latestMap.get(j._id.toString())?.totalMessages ?? 0,
    recruiters:
      (j.recruiterIds as any[] | undefined)?.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        email: r.email,
      })) ?? [],
  }));

  res.json({
    success: true,
    data: items,
  } satisfies ApiResponse<
    {
      id: string;
      title: string;
      companyName: string;
      location: string;
      recruiters: { id: string; name: string; email: string }[];
    }[]
  >);
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Authentication required');
  }

  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(404, 'Message not found');
  }

  // Check access to the job first
  await assertUserHasAccess(message.jobId.toString(), user);

  // Only sender or admin can delete
  const isOwner = message.senderId.toString() === user.userId;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError(403, 'You can only delete your own messages');
  }

  await Message.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  } satisfies ApiResponse<null>);
});

