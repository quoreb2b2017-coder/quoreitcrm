'use client';

import { useMemo } from 'react';
import type { TimelineItem } from '@/types';

function formatDateKey(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  if (dDay.getTime() === today.getTime()) return 'Today';
  if (dDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

type NoteVisualKind =
  | 'status'
  | 'linkedin'
  | 'resume'
  | 'details'
  | 'email'
  | 'internal'
  | 'note';

function classifyNoteItem(item: { id: string; title?: string; description?: string }): NoteVisualKind {
  const t = (item.title ?? '').trim().toLowerCase();
  const d = (item.description ?? '').toLowerCase();
  if (item.id.startsWith('email-') || t === 'email sent') return 'email';
  if (item.id.startsWith('internal-note-') || t === 'internal note') return 'internal';
  if (t === 'status update' || d.includes('status changed from')) return 'status';
  if (t.includes('linkedin') || d.includes('linkedin') || t === 'linkedin sync') return 'linkedin';
  if (t.includes('resume') || d.includes('resume file')) return 'resume';
  if (t.includes('details update') || t.includes('detail') || d.includes('email updated') || d.includes('phone updated') || d.includes('url updated')) {
    return 'details';
  }
  return 'note';
}

function isSyntheticNoteId(id: string): boolean {
  return id.startsWith('email-') || id.startsWith('internal-note-') || id.startsWith('activity-');
}

const NOTE_VISUAL: Record<
  NoteVisualKind,
  { dot: string; card: string; badge: string; label: string; footerTint: string }
> = {
  status: {
    dot: 'bg-blue-600 text-white ring-2 ring-blue-100',
    card: 'bg-white border-blue-200/80 dark:bg-gray-900 dark:border-blue-800/50',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
    label: 'Status',
    footerTint: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  linkedin: {
    dot: 'bg-[#0a66c2] text-white ring-2 ring-sky-100',
    card: 'bg-white border-sky-200/80 dark:bg-gray-900 dark:border-sky-800/50',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200',
    label: 'Profile',
    footerTint: 'bg-sky-50 text-sky-800 border-sky-100 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800',
  },
  resume: {
    dot: 'bg-emerald-600 text-white ring-2 ring-emerald-100',
    card: 'bg-white border-emerald-200/80 dark:bg-gray-900 dark:border-emerald-800/50',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
    label: 'Document',
    footerTint: 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800',
  },
  details: {
    dot: 'bg-amber-500 text-white ring-2 ring-orange-100',
    card: 'bg-white border-amber-200/80 dark:bg-gray-900 dark:border-amber-800/50',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
    label: 'Details',
    footerTint: 'bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
  },
  email: {
    dot: 'bg-violet-600 text-white ring-2 ring-violet-100',
    card: 'bg-white border-violet-200/80 dark:bg-gray-900 dark:border-violet-800/50',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200',
    label: 'Email',
    footerTint: 'bg-violet-50 text-violet-800 border-violet-100 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800',
  },
  internal: {
    dot: 'bg-slate-600 text-white ring-2 ring-slate-200',
    card: 'bg-white border-slate-200/80 dark:bg-gray-900 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    label: 'Internal',
    footerTint: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600',
  },
  note: {
    dot: 'bg-rose-500 text-white ring-2 ring-rose-100',
    card: 'bg-white border-rose-200/80 dark:bg-gray-900 dark:border-rose-800/40',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
    label: 'Note',
    footerTint: 'bg-rose-50 text-rose-900 border-rose-100 dark:bg-rose-950/35 dark:text-rose-200 dark:border-rose-800',
  },
};

function NoteTimelineIcon({ kind }: { kind: NoteVisualKind }) {
  const cls = 'h-3.5 w-3.5';
  switch (kind) {
    case 'status':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'resume':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'details':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'email':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'internal':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
  }
}

export function Timeline({
  items,
  onEditNote,
  onDeleteNote,
  onEditCall,
  onDeleteCall,
  onRefetch,
}: {
  items: TimelineItem[];
  onEditNote?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onEditCall?: (callId: string) => void;
  onDeleteCall?: (callId: string) => void;
  onRefetch?: () => void;
}) {
  void onRefetch;
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of items) {
      const key = formatDateKey(item.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const order = ['Today', 'Yesterday'];
    const keys = Array.from(map.keys());
    const rest = keys.filter((k) => !order.includes(k));
    rest.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return [...order.filter((k) => map.has(k)), ...rest].map((key) => ({ key, list: map.get(key)! }));
  }, [items]);

  return (
    <div className="relative pl-5 sm:pl-6">
      <div className="absolute left-[14px] sm:left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-700 dark:to-transparent" aria-hidden />
      <div className="space-y-5">
        {grouped.map(({ key, list }) => (
          <div key={key} className="relative">
            <h3 className="mb-3 -ml-5 sm:-ml-6 inline-flex items-center px-2.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              {key}
            </h3>

            <div className="space-y-1">
              {list.map((item) => {
                const isCall = item.type === 'call';
                const noteKind = !isCall ? classifyNoteItem(item) : 'note';
                const viz = !isCall ? NOTE_VISUAL[noteKind] : null;

                const isIncomingCall = isCall && item.callType === 'incoming';
                const callDot = isIncomingCall
                  ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                  : 'bg-emerald-600 text-white ring-2 ring-emerald-100';
                const callFooter = isIncomingCall
                  ? 'bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800';

                const dotClass = isCall ? callDot : viz!.dot;
                const footerTint = isCall ? callFooter : viz!.footerTint;
                const synthNote = !isCall && isSyntheticNoteId(item.id);

                return (
                <div key={item.id} className="group relative flex gap-3 sm:gap-4 py-2 pr-1 border-b border-gray-100/80 dark:border-gray-800/80 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 rounded-lg transition-colors duration-200">
                  <div
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white dark:border-gray-900 mt-0.5 shadow-sm ${dotClass}`}
                  >
                    {isCall ? (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ) : (
                      <NoteTimelineIcon kind={noteKind} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isCall ? (isIncomingCall ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200') : viz!.badge}`}>
                            {isCall ? (isIncomingCall ? 'Incoming' : 'Outgoing') : viz!.label}
                          </span>
                          <p className="truncate text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                            {isCall ? (item.outcome || 'Call log') : (item.title || 'Personal Note')}
                          </p>
                          {item.type === 'note' && item.isPinned && (
                            <span className="text-amber-500">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                              </svg>
                            </span>
                          )}
                        </div>

                        {item.type === 'note' && item.description && (
                          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{item.description}</p>
                        )}
                        {item.type === 'call' && item.notes && (
                          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{item.notes}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {isCall && (
                            <span className="font-medium">
                              Duration: {item.duration != null ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : '—'}
                            </span>
                          )}
                          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black border ${footerTint}`}>
                            {item.recruiterName?.charAt(0).toUpperCase() || 'R'}
                          </span>
                          <span className="font-semibold">{item.recruiterName}</span>
                          <span>•</span>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>

                        {item.type === 'note' && item.tags && item.tags.length > 0 && (
                          <div className="pt-0.5 flex flex-wrap gap-1">
                            {item.tags.map((t) => (
                              <span
                                key={t.id}
                                className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded text-white"
                                style={{ backgroundColor: t.color || '#6b7280' }}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
                        {item.type === 'note' ? (
                          <>
                            {onEditNote && !synthNote && (
                              <button
                                type="button"
                                onClick={() => onEditNote(item.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                title="Edit note"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                            {onDeleteNote && !synthNote && (
                              <button
                                type="button"
                                onClick={() => onDeleteNote(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                title="Delete note"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {onEditCall && (
                              <button
                                type="button"
                                onClick={() => onEditCall(item.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                title="Edit call"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )}
                            {onDeleteCall && (
                              <button
                                type="button"
                                onClick={() => onDeleteCall(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                title="Delete call"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
