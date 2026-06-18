'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '@/lib/tokenStore';
import { getSocketOrigin } from '@/lib/apiConfig';

const SOCKET_URL = getSocketOrigin();

type NotifContextValue = {
  // jobId → unread count (real-time only)
  unreadByJob: Record<string, number>;
  totalUnread: number;
  markJobRead: (jobId: string) => void;
  markAllRead: () => void;
  // expose socket so MessagesPage can reuse it instead of creating its own
  socket: Socket | null;
  socketConnected: boolean;
};

const NotifContext = createContext<NotifContextValue>({
  unreadByJob: {},
  totalUnread: 0,
  markJobRead: () => {},
  markAllRead: () => {},
  socket: null,
  socketConnected: false,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadByJob, setUnreadByJob] = useState<Record<string, number>>({});
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Track which jobId the user currently has open so we don't count those messages
  const activeJobRef = useRef<string | null>(null);

  const STORAGE_KEY = `ats:notif:${user?.id ?? 'anon'}`;

  // Hydrate from localStorage on login
  useEffect(() => {
    if (!user?.id) { setUnreadByJob({}); return; }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUnreadByJob(JSON.parse(raw) as Record<string, number>);
    } catch {}
  }, [user?.id, STORAGE_KEY]);

  // Persist to localStorage whenever unread changes
  useEffect(() => {
    if (!user?.id) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(unreadByJob)); } catch {}
  }, [unreadByJob, user?.id, STORAGE_KEY]);

  const markJobRead = useCallback((jobId: string) => {
    activeJobRef.current = jobId;
    setUnreadByJob((prev) => {
      if (!prev[jobId]) return prev;
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadByJob({});
  }, []);

  // Single shared socket — created once when user logs in
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;

    const token = getAccessToken();
    if (!token) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: (cb) => cb({ token: getAccessToken() ?? '' }),
    });

    socketRef.current = s;

    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));

    s.on('receive_message', (msg: { jobId: string; senderId: string }) => {
      // Don't count own messages or messages in the currently open job
      if (msg.senderId === user.id) return;
      if (activeJobRef.current === msg.jobId) return;
      setUnreadByJob((prev) => ({ ...prev, [msg.jobId]: (prev[msg.jobId] ?? 0) + 1 }));
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [user?.id]);

  const totalUnread = Object.values(unreadByJob).reduce((a, b) => a + b, 0);

  return (
    <NotifContext.Provider value={{
      unreadByJob,
      totalUnread,
      markJobRead,
      markAllRead,
      socket: socketRef.current,
      socketConnected,
    }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotifications = () => useContext(NotifContext);
