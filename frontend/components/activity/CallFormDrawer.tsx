import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { Drawer } from '@/components/ui/Drawer';

const OUTCOMES = ['Interested', 'Not Answered', 'Call Back Later', 'Rejected'] as const;

export function CallFormDrawer({
  isOpen,
  onClose,
  candidateId,
  editingCallId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  editingCallId?: string | null;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [outcome, setOutcome] = useState<string>(OUTCOMES[0]);
  const [notes, setNotes] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [createMeetLink, setCreateMeetLink] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timelineData = queryClient.getQueryData(['timeline', candidateId]);
    if (editingCallId && timelineData) {
      const call = (timelineData as any[]).find(i => i.id === editingCallId && i.type === 'call');
      if (call) {
        setType(call.callType || 'outgoing');
        setDurationMinutes(String(Math.floor((call.duration || 0) / 60)));
        setDurationSeconds(String((call.duration || 0) % 60));
        setOutcome(call.outcome || OUTCOMES[0]);
        setNotes(call.notes || '');
        setAddToCalendar(call.addToCalendar || false);
        setCreateMeetLink(call.createMeetLink || false);
      }
    } else if (isOpen) {
      setType('outgoing');
      setDurationMinutes('');
      setDurationSeconds('');
      setOutcome(OUTCOMES[0]);
      setNotes('');
      setAddToCalendar(false);
      setCreateMeetLink(false);
    }
  }, [editingCallId, queryClient, candidateId, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      const mins = parseInt(durationMinutes || '0', 10) || 0;
      const secs = parseInt(durationSeconds || '0', 10) || 0;
      const duration = mins * 60 + secs;
      const payload = {
        candidateId,
        type,
        duration,
        outcome,
        notes: notes || undefined,
        addToCalendar,
        createMeetLink,
      };

      if (editingCallId) {
        return api.calls.update(editingCallId, payload as any);
      }
      return api.calls.create(payload as any);
    },
    onSuccess: () => {
      setDurationMinutes('');
      setDurationSeconds('');
      setNotes('');
      setAddToCalendar(false);
      setCreateMeetLink(false);
      onSuccess();
      toast.success(editingCallId ? 'Call updated successfully' : 'Call logged successfully');
    },
    onError: () => toast.error(editingCallId ? 'Failed to update call' : 'Failed to log call'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addToCalendar || createMeetLink) {
      toast.error('To schedule calendar/Meet events, please use Scheduled Calls and set date & time.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editingCallId ? 'Edit call log' : 'Log call'} className="sm:max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Call Type</label>
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
            {(['incoming', 'outgoing'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${type === t ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Minutes</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Seconds</label>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="0"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Outcome</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none dark:bg-gray-800 dark:border-gray-700"
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Call Summary / Event Details</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
            placeholder="Briefly describe what happened on the call or event details..."
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>Event Integrations</span>
          </label>
          <p className="text-[12px] font-medium text-amber-600 dark:text-amber-300">
            To schedule calendar/Meet events, please use Scheduled Calls and set date & time.
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input 
                type="checkbox" 
                checked={addToCalendar}
                onChange={(e) => setAddToCalendar(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-600 focus:ring-offset-0 disabled:opacity-50"
              />
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200 leading-tight">Add to Google Calendar</span>
                  <span className="text-[12px] font-medium text-gray-400">Schedule this event in your calendar</span>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800">
              <input 
                type="checkbox" 
                checked={createMeetLink}
                onChange={(e) => setCreateMeetLink(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:border-gray-600 focus:ring-offset-0 disabled:opacity-50"
              />
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200 leading-tight">Add Google Meet Link</span>
                  <span className="text-[12px] font-medium text-gray-400">Generate a video conferencing link</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-50">
          {editingCallId && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this call log?')) {
                  api.calls.delete(editingCallId).then(() => {
                    toast.success('Call log deleted');
                    onSuccess();
                  }).catch(() => toast.error('Failed to delete call log'));
                }
              }}
              className="px-4 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
              title="Delete this log"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-[13px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {mutation.isPending ? 'Processing...' : (editingCallId ? 'Update Log' : 'Save Log')}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
