'use client';

import { useState } from 'react';
import { Calendar, Bell, Clock, X, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface FollowUpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
}

const QUICK_DATES = [
  { id: '1d', label: 'In 1 day', d: 1 },
  { id: '3d', label: 'In 3 days', d: 3 },
  { id: '1w', label: 'In 1 week', d: 7 },
  { id: '2w', label: 'In 2 weeks', d: 14 }
];

export function FollowUpDrawer({ isOpen, onClose, candidate }: FollowUpDrawerProps) {
  const [reminderNote, setReminderNote] = useState('');
  const [selectedDateId, setSelectedDateId] = useState('1d');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate save
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed top-[100px] inset-x-0 bottom-0 z-[110] flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={onClose} />

      {/* Content Wrapper - STOP PROPAGATION to prevent closing on interaction */}
      <div
        className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Header Style */}
        <div className="flex-none bg-white lg:px-10 px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100/50">
              <Calendar className="h-6 w-6" />
            </div>
            <button onClick={onClose} className="p-2.5 bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all outline-none focus:ring-2 focus:ring-amber-500/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-[28px] font-black tracking-tight text-slate-900 leading-none">Schedule Follow-up</h2>
          <p className="text-[14px] text-slate-500 font-bold mt-3 leading-relaxed">
            Set a reminder for <span className="text-slate-900">{candidate?.name}</span>. We&apos;ll notify you when it&apos;s time to reach back out.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 lg:px-10 px-6 py-4 flex flex-col gap-10">

          {/* Quick Date Select */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="h-3 w-3" />
              When should we follow up?
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_DATES.map(date => (
                <button
                  key={date.id}
                  type="button"
                  onClick={() => setSelectedDateId(date.id)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-sm font-bold active:scale-[0.98] ${selectedDateId === date.id
                    ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg shadow-amber-100/30'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                >
                  {date.label}
                  {selectedDateId === date.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Context Note */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              Follow-up Context
            </h3>
            <div className="relative group">
              <textarea
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                placeholder="e.g. Call to discuss the new package offer or check if they've received the offer letter..."
                className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6 text-[14px] font-bold text-slate-700 placeholder:text-slate-300 outline-none min-h-[160px] focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
              />
              <div className="absolute top-6 right-6 text-amber-200 opacity-40">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Intelligence Recommendation */}
          <div className="p-6 bg-emerald-50/30 border border-emerald-100/50 rounded-3xl flex items-start gap-5">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 leading-none">Smart Recommendation</p>
              <p className="text-[13px] text-emerald-700 font-bold leading-relaxed">
                {(candidate?.name?.split(' ')[0]) || 'This candidate'} responded fast last time. A 1-day follow up is highly effective.
              </p>
            </div>
          </div>
        </form>

        {/* Action Bar */}
        <div className="flex-none lg:px-10 px-6 py-8 border-t border-slate-50 bg-white">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reminderNote}
              className="flex-1 py-4.5 bg-slate-900 text-white rounded-3xl font-black text-[13px] uppercase tracking-[0.15em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 outline-none focus:ring-4 focus:ring-slate-900/10"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Confirm reminder'
              )}
            </button>
            <button onClick={onClose} className="px-6 py-4.5 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
}
