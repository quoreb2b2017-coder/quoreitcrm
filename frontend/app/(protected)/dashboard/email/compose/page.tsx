'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail } from 'lucide-react';
import { RouteGuard } from '@/components/RouteGuard';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailComposePage() {
  const { user } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const gmailReady = !!user?.gmailConnected && !!user?.googleEmail;

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setToast('Fill in To, Subject, and body.');
      return;
    }
    setSending(true);
    setToast(null);
    try {
      const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;">${body
        .split('\n')
        .map((line) => `<p>${line.replace(/</g, '&lt;')}</p>`)
        .join('')}</div>`;
      await api.emails.send({
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        subject: subject.trim(),
        html,
      });
      setToast('Sent.');
      setTo('');
      setSubject('');
      setBody('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Send failed.';
      setToast(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['admin', 'recruiter']}>
      <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/email"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Inbox
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compose</h1>
          <p className="mt-1 text-sm text-slate-600">
            Messages are sent from your connected Gmail ({user?.googleEmail ?? 'not connected yet'}).
            {!gmailReady && ' (Falling back to system email via Resend)'}
          </p>
        </div>

        {!gmailReady ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2 items-start">
            <Mail className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gmail not connected</p>
              <p className="mt-1 opacity-90">Emails will go out via system fallback. For personal branding, connect your Gmail.</p>
              <Link href="/dashboard/email" className="inline-block mt-2 font-semibold underline">
                Go to Email settings
              </Link>
            </div>
          </div>
        ) : null}

        <div className="panel border border-slate-200 rounded-xl p-5 sm:p-8 space-y-4 bg-white">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Write your email…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-y min-h-[200px]"
            />
          </div>

          {toast && (
            <p className={`text-sm ${toast === 'Sent.' ? 'text-emerald-600' : 'text-red-600'}`}>{toast}</p>
          )}

          <button
            type="button"
            disabled={sending}
            onClick={() => void handleSend()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending…' : 'Send email'}
          </button>
        </div>
      </div>
    </RouteGuard>
  );
}
