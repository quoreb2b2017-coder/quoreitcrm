'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Mail, RefreshCw, Inbox, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RouteGuard } from '@/components/RouteGuard';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const AUTH_ME_KEY = ['auth', 'me'] as const;

type ThreadRow = {
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
  lastSender: string;
};

type ThreadMsg = {
  id: string;
  sender: string;
  subject: string;
  message: string;
  snippet?: string;
  internalDate: string;
};

export default function EmailInboxPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const g = searchParams.get('google');
    if (g === 'connected' || g === 'scope_missing') {
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
      setBanner(
        g === 'connected'
          ? 'Google account connected. You can sync inbox and send mail from your Gmail address.'
          : 'Required Google permissions were not granted. Disconnect and connect again, then accept all prompts.'
      );
      const url = new URL(window.location.href);
      url.searchParams.delete('google');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams, queryClient]);

  const gmailReady = !!user?.gmailConnected && !!user?.googleEmail;

  const threadsQuery = useQuery({
    queryKey: ['emails', 'inbox', 'threads'],
    queryFn: async () => {
      const { data } = await api.emails.inboxThreads({ limit: 50 });
      return (data?.data?.items ?? []) as ThreadRow[];
    },
    enabled: gmailReady,
  });

  const threadQuery = useQuery({
    queryKey: ['emails', 'inbox', 'thread', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return null;
      const { data } = await api.emails.inboxThread(selectedThreadId);
      return data?.data ?? null;
    },
    enabled: !!selectedThreadId && gmailReady,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.emails.syncInbox({
        maxResults: 35,
        query: 'in:inbox newer_than:120d',
      });
      return data?.data?.synced ?? 0;
    },
    onSuccess: (synced) => {
      void queryClient.invalidateQueries({ queryKey: ['emails', 'inbox'] });
      setBanner(`Synced ${synced} message(s) from Gmail.`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setBanner(msg ?? 'Sync failed. Check Gmail connection.');
    },
  });

  const connectGmail = async () => {
    const { data } = await api.auth.googleUrl({ returnTo: '/dashboard/email' });
    const url = data?.data?.url;
    if (url) window.location.href = url;
  };

  const threads = threadsQuery.data ?? [];
  const messages = (threadQuery.data?.messages ?? []) as ThreadMsg[];

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="space-y-4 sm:space-y-6 -mx-4 sm:-mx-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between min-w-0 px-4 sm:px-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email</h1>
            <p className="mt-1 text-sm text-slate-600">
              Send and receive through your own Gmail. Connect once, then sync the inbox.
            </p>
            {user?.googleEmail && (
              <p className="mt-2 text-xs font-medium text-slate-500">
                Linked Gmail: <span className="text-slate-800">{user.googleEmail}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/email/compose"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Send className="w-4 h-4" />
              Compose
            </Link>
            {!gmailReady ? (
              <button
                type="button"
                onClick={() => void connectGmail()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Mail className="w-4 h-4" />
                Connect Gmail
              </button>
            ) : (
              <button
                type="button"
                disabled={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync inbox
              </button>
            )}
          </div>
        </div>

        {banner && (
          <div className="mx-4 sm:mx-0 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {banner.includes('permission') || banner.includes('failed') ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            )}
            <span>{banner}</span>
            <button type="button" className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800" onClick={() => setBanner(null)}>
              Dismiss
            </button>
          </div>
        )}

        {!gmailReady ? (
          <div className="mx-4 sm:mx-0 panel p-8 text-center border border-dashed border-slate-200 rounded-xl bg-white">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-700 font-medium">Connect Gmail to load your inbox and send as you.</p>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Uses Google OAuth (send + read). Enable the Gmail API in Google Cloud for this OAuth client.
            </p>
            <button
              type="button"
              onClick={() => void connectGmail()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Mail className="w-4 h-4" />
              Connect Gmail
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 min-h-[560px] rounded-xl border border-slate-200 bg-white overflow-hidden mx-4 sm:mx-0 shadow-sm">
            <aside className="w-full lg:w-[340px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col max-h-[420px] lg:max-h-none">
              <div className="px-4 py-3 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                Threads
              </div>
              <div className="flex-1 overflow-y-auto">
                {threadsQuery.isLoading ? (
                  <div className="p-6 text-sm text-slate-500">Loading…</div>
                ) : threads.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">No synced threads yet. Press “Sync inbox”.</div>
                ) : (
                  threads.map((t) => {
                    const active = t.threadId === selectedThreadId;
                    return (
                      <button
                        key={t.threadId}
                        type="button"
                        onClick={() => setSelectedThreadId(t.threadId)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                          active ? 'bg-blue-50/80 border-l-4 border-l-blue-600 pl-3' : 'hover:bg-white border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex justify-between gap-2 items-start">
                          <span className="font-semibold text-slate-900 text-sm line-clamp-1">{t.subject || '(no subject)'}</span>
                          {t.unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{t.snippet}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          {t.lastMessageAt ? format(new Date(t.lastMessageAt), 'MMM d, h:mm a') : ''}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <main className="flex-1 flex flex-col min-h-[360px] bg-white">
              {!selectedThreadId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <Inbox className="w-14 h-14 mb-3 opacity-40" />
                  <p className="text-sm font-medium">Select a thread</p>
                </div>
              ) : threadQuery.isLoading ? (
                <div className="p-8 text-sm text-slate-500">Loading conversation…</div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="px-6 py-4 border-b border-slate-200 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 line-clamp-2">
                      {messages[0]?.subject || '(no subject)'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{messages.length} message(s) in thread</p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {messages.map((m) => (
                      <article key={m.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                        <div className="flex justify-between gap-2 text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-slate-800 break-all">{m.sender}</span>
                          <span className="shrink-0">
                            {m.internalDate ? format(new Date(m.internalDate), 'MMM d, yyyy h:mm a') : ''}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-slate-800 [&_a]:text-blue-600"
                          dangerouslySetInnerHTML={{ __html: m.message || m.snippet || '' }}
                        />
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
