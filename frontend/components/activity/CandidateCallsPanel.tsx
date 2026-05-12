'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function CandidateCallsPanel({ candidateName }: { candidateName?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEmbedded = !!candidateName;
  const [googleConnected, setGoogleConnected] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingScheduledCall, setEditingScheduledCall] = useState<any | null>(null);
  const [selectedCandidateFilterId, setSelectedCandidateFilterId] = useState<string | null>(null);

  const { data: candidateOptions, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['calls-page-candidates'],
    queryFn: async () => {
      const { data } = await api.candidates.list({ page: 1, limit: 100 });
      return data.data?.items ?? [];
    },
  });

  useEffect(() => {
    if (user) {
      setGoogleConnected(!!user.googleConnected);
      setPhoneNumbers(user.phoneNumbers || []);
    }
  }, [user]);

  // After Google OAuth callback, backend redirects to /dashboard/activity?google=connected
  // Force-refresh auth state so UI immediately reflects googleConnected.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get('google');
    if (googleParam !== 'connected' && googleParam !== 'scope_missing') return;

    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    if (googleParam === 'connected') {
      toast.success('Google connected');
    } else {
      toast.error('Google connected without Calendar permission. Please reconnect and allow Calendar access.');
    }

    params.delete('google');
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash ?? ''}`;
    window.history.replaceState({}, '', nextUrl);
  }, [queryClient]);

  const { data: scheduledCallsRaw } = useQuery({
    queryKey: ['calls', 'scheduled'],
    queryFn: async () => {
      const { data } = await api.calls.listScheduled();
      return (data as any)?.data ?? [];
    },
    staleTime: 10 * 1000,
  });

  const scheduledCalls = useMemo(() => {
    const list = (scheduledCallsRaw ?? []) as any[];
    const filtered = selectedCandidateFilterId
      ? list.filter((c) => c.candidate?.id === selectedCandidateFilterId)
      : list;
    // sort newest first by startAt, fallback createdAt
    return [...filtered].sort((a, b) => {
      const da = new Date(a.startAt ?? a.createdAt ?? 0).getTime();
      const db = new Date(b.startAt ?? b.createdAt ?? 0).getTime();
      return db - da;
    });
  }, [scheduledCallsRaw, selectedCandidateFilterId]);

  // Optional: could scroll into view here if needed for very small screens

  const handleUpdate = async (updates: any) => {
    if (!user?.id) return;
    setIsUpdating(true);
    try {
      const response = await api.users.updateProfile(user.id, updates);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Settings updated');
      return response;
    } catch (error) {
      toast.error('Failed to update settings');
      console.error(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const savePhoneNumber = async () => {
    if (newPhoneNumber.trim()) {
      let updatedNumbers;
      if (editingIndex !== null) {
        updatedNumbers = [...phoneNumbers];
        updatedNumbers[editingIndex] = newPhoneNumber.trim();
      } else {
        updatedNumbers = [...phoneNumbers, newPhoneNumber.trim()];
      }

      // Optimistic update for better UX
      const previousNumbers = phoneNumbers;
      setPhoneNumbers(updatedNumbers);

      try {
        await handleUpdate({
          phoneNumbers: updatedNumbers,
          phoneConnected: updatedNumbers.length > 0
        });
        setIsAddingPhone(false);
        setEditingIndex(null);
        setNewPhoneNumber('');
      } catch (error) {
        // Revert local state on failure
        setPhoneNumbers(previousNumbers);
      }
    }
  };

  const deletePhoneNumber = (index: number) => {
    if (window.confirm('Are you sure you want to remove this phone number?')) {
      const updatedNumbers = phoneNumbers.filter((_, i) => i !== index);
      handleUpdate({
        phoneNumbers: updatedNumbers,
        phoneConnected: updatedNumbers.length > 0
      });
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewPhoneNumber(phoneNumbers[index]);
    setIsAddingPhone(true);
  };

  const phoneConnected = phoneNumbers.length > 0;

  return (
    <div className={`w-full flex flex-col font-sans ${isEmbedded ? 'bg-white' : 'bg-[#fafafa]'}`}>
      <div className={isEmbedded ? 'px-3 py-4 sm:px-4 sm:py-6' : 'px-4 py-8 sm:px-8 sm:py-12 md:px-12 lg:px-16'}>
        <div className={isEmbedded ? 'max-w-none' : 'max-w-5xl mx-auto'}>

          {!isEmbedded && (
            <>
              {/* ── Hero ── */}
              <div className="mb-10 rounded-[28px] border border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-[900] uppercase tracking-[0.18em] text-gray-700 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Parascribe enabled
                    </div>

                    <h1 className="mt-4 text-[28px] sm:text-[34px] md:text-[42px] font-[950] tracking-tight text-gray-900 leading-[1.05]">
                      Paraform Calls
                    </h1>
                    <p className="mt-3 text-[14px] sm:text-[15px] md:text-[16px] text-gray-600 max-w-2xl leading-relaxed font-medium">
                      Parascribe (our AI notetaker) joins calls, transcribes + summarizes, and helps you ship faster submissions. Free for recruiters.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[12px] font-[900] uppercase tracking-[0.16em] text-gray-900 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                      How it works
                    </a>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-[12px] font-[900] uppercase tracking-[0.16em] text-white shadow-sm hover:shadow-md hover:bg-black transition-all active:scale-[0.98]"
                    >
                      <span className="text-[14px]">🤖</span>
                      Schedule demo
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <EditIcon />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-[900] text-gray-900 uppercase tracking-tight">Transcripts</div>
                        <div className="text-[12px] text-gray-500 font-medium">Auto notes + summaries</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <SparklesIcon />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-[900] text-gray-900 uppercase tracking-tight">Ask Parascribe</div>
                        <div className="text-[12px] text-gray-500 font-medium">Search any call instantly</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <BoltIcon />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-[900] text-gray-900 uppercase tracking-tight">Submissions</div>
                        <div className="text-[12px] text-gray-500 font-medium">AI-ready candidate writeups</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <PersonIcon />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-[900] text-gray-900 uppercase tracking-tight">Role matching</div>
                        <div className="text-[12px] text-gray-500 font-medium">Better shortlists, faster</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-center text-[11px] font-[900] uppercase tracking-[0.26em] text-gray-400">
                  Setup takes 1 minute
                </div>
              </div>
            </>
          )}

          <div className="border border-gray-100 rounded-[24px] bg-white p-4 sm:p-6 shadow-sm">
            <div className={`grid grid-cols-1 gap-4 items-start ${isEmbedded ? '' : 'sm:grid-cols-2'}`}>

              {/* Google Calendar Card */}
              <div className={`rounded-[18px] border border-gray-100 bg-white p-6 sm:p-7 flex flex-col gap-5 ${isEmbedded ? '' : 'sm:col-start-1'}`}>
                <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                  <GoogleIcon />
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[17px] sm:text-[19px] font-[900] text-gray-900 leading-snug">
                      Schedule Google Meet calls
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-gray-400 font-medium leading-relaxed">
                      Create scheduled candidate calls with a single form – perfect for admins and recruiters.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!googleConnected) {
                          try {
                            // Ensure we don't keep an old refresh token with missing scopes
                            await api.auth.googleDisconnect().catch(() => {});
                            const { data } = await api.auth.googleUrl();
                            const url = (data as any)?.data?.url;
                            if (!url) throw new Error('Missing Google URL');
                            window.location.href = url;
                          } catch (err: any) {
                            console.error(err);
                            toast.error(err?.response?.data?.message ?? 'Failed to start Google connect');
                          }
                          return;
                        }
                        setShowScheduler((prev) => !prev);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-[11px] sm:text-[12px] font-[900] uppercase tracking-[0.18em] text-white shadow-sm hover:shadow-md hover:bg-black transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                    >
                      {!googleConnected ? 'Connect Google' : showScheduler ? 'Close scheduler' : 'New scheduled call'}
                    </button>
                    {googleConnected && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.auth.googleDisconnect();
                            const { data } = await api.auth.googleUrl();
                            const url = (data as any)?.data?.url;
                            if (!url) throw new Error('Missing Google URL');
                            window.location.href = url;
                          } catch (err: any) {
                            console.error(err);
                            toast.error(err?.response?.data?.message ?? 'Failed to reconnect Google');
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[11px] sm:text-[12px] font-[900] uppercase tracking-[0.18em] text-gray-900 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                      >
                        Reconnect Google
                      </button>
                    )}
                    {!googleConnected && (
                      <span className="text-[12px] text-gray-500 font-medium">
                        Required to generate a valid Meet link.
                      </span>
                    )}
                  </div>

                  {showScheduler && (
                    <div
                      id="calls-scheduler-card"
                      className="mt-4 rounded-2xl bg-white border border-gray-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-4 py-5 sm:px-6 sm:py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 ease-out"
                    >
                      <div className={`grid grid-cols-1 gap-4 ${isEmbedded ? '' : 'lg:grid-cols-2 lg:gap-5'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.16em]">
                            Candidate
                          </label>
                          <select
                            value={selectedCandidateId}
                            onChange={(e) => setSelectedCandidateId(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors duration-200"
                          >
                            <option value="">{isLoadingCandidates ? 'Loading…' : 'Select candidate'}</option>
                            {candidateOptions?.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name} — {c.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.16em]">
                            Date
                          </label>
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors duration-200"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.16em]">
                            Start time
                          </label>
                          <input
                            type="time"
                            value={eventStartTime}
                            onChange={(e) => setEventStartTime(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors duration-200"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.16em]">
                            End time
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="time"
                              value={eventEndTime}
                              onChange={(e) => setEventEndTime(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-gray-400 leading-relaxed sm:max-w-[60%]">
                          Recruiters see only their own candidates. Admins see every candidate across the workspace.
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!selectedCandidateId) {
                              toast.error('Please select a candidate.');
                              return;
                            }
                            if (!eventDate || !eventStartTime || !eventEndTime) {
                              toast.error('Please select date, start time and end time.');
                              return;
                            }

                            try {
                              const start = new Date(`${eventDate}T${eventStartTime}:00`);
                              const end = new Date(`${eventDate}T${eventEndTime}:00`);
                              const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

                              if (editingScheduledCall?.id) {
                                await api.calls.update(editingScheduledCall.id, {
                                  duration,
                                  outcome: 'Call Back Later',
                                  notes: editingScheduledCall.notes ?? 'Updated from Paraform Calls page',
                                  addToCalendar: true,
                                  createMeetLink: true,
                                  startAt: start.toISOString(),
                                  endAt: end.toISOString(),
                                } as any);
                              } else {
                                await api.calls.create({
                                  candidateId: selectedCandidateId,
                                  type: 'outgoing',
                                  duration,
                                  outcome: 'Call Back Later',
                                  notes: 'Scheduled from Paraform Calls page',
                                  addToCalendar: true,
                                  createMeetLink: true,
                                  startAt: start.toISOString(),
                                  endAt: end.toISOString(),
                                } as any);
                              }

                              toast.success(editingScheduledCall?.id ? 'Call updated' : 'Call scheduled');
                              await queryClient.invalidateQueries({ queryKey: ['calls', 'scheduled'] });
                              setEventDate('');
                              setEventStartTime('');
                              setEventEndTime('');
                              setShowScheduler(false);
                              setEditingScheduledCall(null);
                            } catch (err: any) {
                              console.error(err);
                              const msg = err?.response?.data?.message ?? 'Failed to schedule call';
                              toast.error(msg);
                              // If Google scopes are missing, force user to reconnect
                              if (
                                (err?.response?.status === 401 || err?.response?.status === 403) &&
                                typeof msg === 'string' &&
                                (msg.toLowerCase().includes('google') || msg.toLowerCase().includes('reconnect'))
                              ) {
                                setGoogleConnected(false);
                                setShowScheduler(false);
                              }
                            }
                          }}
                          className="inline-flex w-full sm:w-auto max-w-full items-center justify-center rounded-full bg-gray-900 px-5 sm:px-6 py-3 text-[12px] font-[900] uppercase tracking-[0.16em] text-white shadow-sm hover:shadow-md hover:bg-black transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                        >
                          {editingScheduledCall?.id ? 'Update call' : 'Schedule call'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Phone Number Card */}
              <div className={`rounded-[18px] border border-gray-100 bg-white p-6 sm:p-7 flex flex-col gap-5 ${isEmbedded ? '' : 'sm:col-start-2 sm:self-start'}`}>
                <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                  <PhoneBlueIcon />
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                  <h3 className="text-[17px] sm:text-[19px] font-[900] text-gray-900 leading-snug">
                    {phoneConnected ? 'Phone numbers added' : 'Add phone number'}
                  </h3>

                  {phoneNumbers.length > 0 ? (
                    <div className="flex flex-col gap-3 mt-2">
                      {phoneNumbers.map((num, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                          <span className="text-[14px] font-bold text-gray-900">{num}</span>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(idx)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <EditIconSmall />
                            </button>
                            <button onClick={() => deletePhoneNumber(idx)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] sm:text-[14px] text-gray-400 font-medium leading-relaxed">
                      Parascribe will connect and record your candidate phone calls.
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  {isAddingPhone ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          {editingIndex !== null ? 'Edit Phone Number' : 'New Phone Number'}
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && savePhoneNumber()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsAddingPhone(false);
                            setEditingIndex(null);
                            setNewPhoneNumber('');
                          }}
                          className="flex-1 py-3.5 rounded-xl text-[12px] font-[900] uppercase tracking-widest text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={savePhoneNumber}
                          disabled={!newPhoneNumber.trim() || isUpdating}
                          className="flex-1 py-3.5 rounded-xl text-[12px] font-[900] uppercase tracking-widest text-white bg-blue-600 shadow-sm hover:shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/25"
                        >
                          {isUpdating ? 'SAVING...' : 'SAVE'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingPhone(true)}
                      className="w-full py-4 rounded-2xl text-[12px] sm:text-[13px] font-[900] uppercase tracking-[0.18em] bg-gray-900 text-white shadow-sm hover:shadow-md hover:bg-black transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                    >
                      {phoneNumbers.length > 0 ? 'ADD ANOTHER NUMBER' : 'ADD PHONE NUMBER'}
                    </button>
                  )}
                </div>
              </div>

              {/* Scheduled calls list */}
              <div className={`${isEmbedded ? '' : 'sm:col-span-2'} mt-4 rounded-[18px] border border-gray-100 bg-white p-6 sm:p-7`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[15px] sm:text-[17px] font-[900] text-gray-900">
                      Scheduled calls
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-gray-400 font-medium">
                      Sorted by date (newest first). Click a candidate to filter.
                    </p>
                  </div>
                  {selectedCandidateFilterId && (
                    <button
                      type="button"
                      onClick={() => setSelectedCandidateFilterId(null)}
                      className="self-start sm:self-auto inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-[12px] font-[900] uppercase tracking-[0.16em] text-gray-900 hover:bg-gray-50 transition-all"
                    >
                      Clear filter
                    </button>
                  )}
                </div>

                {scheduledCalls.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-[13px] text-gray-500">
                    No scheduled calls yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledCalls.map((c) => {
                      const start = c.startAt ? new Date(c.startAt) : null;
                      const end = c.endAt ? new Date(c.endAt) : null;
                      const dateLabel = start
                        ? start.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—';
                      const timeLabel =
                        start && end
                          ? `${start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
                          : '—';

                      const candidateLabel = c.candidate?.name
                        ? `${c.candidate.name} — ${c.candidate.email ?? ''}`.trim()
                        : 'Candidate';

                      return (
                        <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 md:gap-4 items-start">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setSelectedCandidateFilterId(c.candidate?.id ?? null)}
                                className="block w-full text-left font-[900] text-gray-900 hover:underline underline-offset-4 truncate"
                                title={candidateLabel}
                              >
                                {candidateLabel}
                              </button>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-gray-500 font-medium">
                                <span className="whitespace-nowrap">{dateLabel}</span>
                                <span className="text-gray-300">·</span>
                                <span className="whitespace-nowrap">{timeLabel}</span>
                                {user?.role === 'admin' && c.recruiterName ? (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="whitespace-nowrap">{c.recruiterName}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
                              {c.meetLink ? (
                                <>
                                  <a
                                    href={c.meetLink}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 text-[11px] font-[900] uppercase tracking-[0.16em] text-white hover:bg-black transition-colors"
                                  >
                                    Join Meet
                                  </a>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await navigator.clipboard?.writeText(c.meetLink);
                                      toast.success('Copied');
                                    }}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-[11px] font-[900] uppercase tracking-[0.16em] text-gray-900 hover:bg-gray-50 transition-colors"
                                  >
                                    Copy link
                                  </button>
                                </>
                              ) : (
                                <span className="text-[12px] text-gray-500 font-medium">
                                  Meet link pending
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingScheduledCall(c);
                                  setSelectedCandidateId(c.candidate?.id ?? '');
                                  if (c.startAt) {
                                    const s = new Date(c.startAt);
                                    setEventDate(s.toISOString().slice(0, 10));
                                    setEventStartTime(s.toTimeString().slice(0, 5));
                                  }
                                  if (c.endAt) {
                                    const e = new Date(c.endAt);
                                    setEventEndTime(e.toTimeString().slice(0, 5));
                                  }
                                  setShowScheduler(true);
                                  toast('Editing scheduled call', { icon: '✏️' });
                                }}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-[11px] font-[900] uppercase tracking-[0.16em] text-gray-900 hover:bg-gray-50 transition-colors"
                              >
                                Edit
                              </button>

                              {user?.role === 'admin' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm('Delete this scheduled call?')) return;
                                    try {
                                      await api.calls.delete(c.id);
                                      toast.success('Deleted');
                                      await queryClient.invalidateQueries({ queryKey: ['calls', 'scheduled'] });
                                    } catch (err: any) {
                                      console.error(err);
                                      toast.error(err?.response?.data?.message ?? 'Failed to delete');
                                    }
                                  }}
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-red-200 bg-white px-4 py-2 text-[11px] font-[900] uppercase tracking-[0.16em] text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Reusable Feature Chip ── */
function Feature({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-[52px] md:h-[52px] rounded-[13px] sm:rounded-[15px] bg-[#1a1c1e] flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-200">
        {icon}
      </div>
      <span className="text-[10px] sm:text-[11px] font-[900] text-black leading-[1.5] tracking-tight">
        {label}
      </span>
    </div>
  );
}

/* ── Icons ── */
function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function PhoneBlueIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function EditIconSmall() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
