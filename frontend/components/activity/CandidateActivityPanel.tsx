'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import type { TimelineItem } from '@/types';
import { Timeline } from './Timeline';
import { NoteFormDrawer } from './NoteFormDrawer';
import { CallFormDrawer } from './CallFormDrawer';

type FilterType = 'all' | 'notes' | 'calls';

export function CandidateActivityPanel({
  candidateId,
  candidateName, // passed for optional display; not used in this panel
  isCandidateRole,
}: {
  candidateId: string;
  candidateName?: string;
  isCandidateRole: boolean;
}) {
  void candidateName; // reserve for future heading
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [callDrawerOpen, setCallDrawerOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingCallId, setEditingCallId] = useState<string | null>(null);

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['timeline', candidateId],
    queryFn: async () => {
      const res = await api.timeline.get(candidateId);
      if (!res.data?.data) return [];
      return res.data.data as TimelineItem[];
    },
    enabled: !!candidateId,
  });

  const filteredItems = useMemo(() => {
    let items = timelineData ?? [];
    if (filter === 'notes') items = items.filter((i) => i.type === 'note');
    else if (filter === 'calls') items = items.filter((i) => i.type === 'call');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => {
        if (i.type === 'note') {
          return (i.title?.toLowerCase().includes(q)) || (i.description?.toLowerCase().includes(q));
        }
        if (i.type === 'call') return (i.notes?.toLowerCase().includes(q));
        return false;
      });
    }
    return items;
  }, [timelineData, filter, search]);

  const canAdd = !isCandidateRole;

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => api.notes.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] });
      toast.success('Note deleted successfully');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const deleteCallMutation = useMutation({
    mutationFn: (callId: string) => api.calls.delete(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] });
      toast.success('Call log deleted successfully');
    },
    onError: () => toast.error('Failed to delete call log'),
  });

  const deleteNote = (noteId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Delete this note?')) deleteNoteMutation.mutate(noteId);
  };

  const deleteCall = (callId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Delete this call log?')) deleteCallMutation.mutate(callId);
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-white overflow-hidden dark:bg-gray-900">
      {/* Search and Filters Header */}
      <div className="shrink-0 border-b border-gray-100 p-4 dark:border-gray-800 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-1 sm:px-2">

          {/* Add Actions */}
          <div className="flex items-center gap-2">
            {canAdd && (
              <>
                <button
                  type="button"
                  onClick={() => { setEditingNoteId(null); setNoteDrawerOpen(true); }}
                  className="group inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-[13px] font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 dark:hover:text-blue-300"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  Add note
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingCallId(null); setCallDrawerOpen(true); }}
                  className="group inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:border-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/25 active:scale-[0.99]"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-white transition-colors group-hover:bg-white/25">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  Log call
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-full lg:w-[440px] xl:w-[520px]">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search activity, notes, or call logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-10 text-[13px] font-medium text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-white focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-blue-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Clear search"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex h-10 items-center p-1 bg-gray-100/80 dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700">
              {(['all', 'notes', 'calls'] as const).map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 min-h-0">
        {isLoading ? (
          <div className="space-y-10 pl-6 border-l-2 border-gray-50 ml-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[37px] h-6 w-6 rounded-full bg-gray-100 animate-pulse border-2 border-white" />
                <div className="h-32 animate-pulse rounded-2xl bg-gray-50/80 dark:bg-gray-800/50" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-700">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white font-black text-[15px] uppercase tracking-widest">No Activity Records</h3>
            <p className="text-gray-400 dark:text-gray-500 text-[14px] mt-2 max-w-[240px]">
              {timelineData?.length === 0
                ? 'Intelligence timeline is empty. Record your first interaction.'
                : 'No records found matching your current filter.'}
            </p>
          </div>
        ) : (
          <Timeline
            items={filteredItems}
            onEditNote={canAdd ? (id) => { setEditingNoteId(id); setNoteDrawerOpen(true); } : undefined}
            onDeleteNote={canAdd ? (id) => deleteNote(id) : undefined}
            onEditCall={canAdd ? (id) => { setEditingCallId(id); setCallDrawerOpen(true); } : undefined}
            onDeleteCall={canAdd ? (id) => deleteCall(id) : undefined}
            onRefetch={() => queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] })}
          />
        )}
      </div>

      {canAdd && (
        <>
          <NoteFormDrawer
            isOpen={noteDrawerOpen}
            onClose={() => { setNoteDrawerOpen(false); setEditingNoteId(null); }}
            candidateId={candidateId}
            editingNoteId={editingNoteId}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] });
              setNoteDrawerOpen(false);
              setEditingNoteId(null);
            }}
          />
          <CallFormDrawer
            isOpen={callDrawerOpen}
            onClose={() => { setCallDrawerOpen(false); setEditingCallId(null); }}
            candidateId={candidateId}
            editingCallId={editingCallId}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['timeline', candidateId] });
              setCallDrawerOpen(false);
              setEditingCallId(null);
            }}
          />
        </>
      )}
    </div>
  );
}
