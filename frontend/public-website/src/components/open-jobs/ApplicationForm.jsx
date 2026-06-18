'use client';

import { useEffect, useState } from 'react';
import { X, Upload, Briefcase, CheckCircle2, FileText } from 'lucide-react';
import { submitApplication } from '@/lib/jobsApi';

const BRAND = '#00d9a6';

const inputClass =
  'w-full h-10 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#00d9a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00d9a6]/15 [color-scheme:light]';

const textareaClass =
  'w-full min-h-[72px] rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm leading-snug text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#00d9a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00d9a6]/15 resize-y [color-scheme:light]';

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {required ? <span className="text-[#00d9a6]"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function ApplicationForm({ job, onClose, onSuccess }) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [questionAnswers, setQuestionAnswers] = useState(() =>
    (job.personalQuestions || []).map((q) => ({ question: q.question, answer: '', required: q.required }))
  );
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const missing = questionAnswers.filter((q) => q.required && !q.answer.trim());
      if (missing.length) throw new Error('Please answer all required questions.');
      const fd = new FormData();
      fd.append('jobId', job._id);
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('coverLetter', form.message);
      fd.append(
        'questionAnswers',
        JSON.stringify(questionAnswers.map(({ question, answer }) => ({ question, answer })))
      );
      if (resume) fd.append('resume', resume);
      await submitApplication(fd);
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1800);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close application form"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-drawer-title"
        className={`relative flex h-full w-full max-w-[400px] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-0.5 shrink-0 bg-gradient-to-r from-[#00d9a6] to-[#00b894]" />

        {/* Header — compact */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#007a5c]">Apply</p>
            <h2 id="apply-drawer-title" className="mt-0.5 text-base font-bold leading-tight text-gray-900 line-clamp-2">
              {job.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
              <Briefcase className="h-3 w-3 shrink-0" />
              Confidential · Quore IT
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — tight spacing */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {success ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-2 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Application submitted</h3>
              <p className="mt-1.5 text-sm text-gray-500">
                We&apos;ll review your profile and reach out if there&apos;s a match.
              </p>
            </div>
          ) : (
            <form id="apply-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Contact — grouped */}
              <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your details</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="First name" required>
                    <input
                      required
                      placeholder="Jane"
                      className={inputClass}
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </Field>
                  <Field label="Last name" required>
                    <input
                      required
                      placeholder="Doe"
                      className={inputClass}
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    placeholder="you@email.com"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    placeholder="+1 555 000 0000"
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </Field>
              </div>

              {/* Questions */}
              {questionAnswers.length > 0 && (
                <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Screening</p>
                  {questionAnswers.map((q, i) => (
                    <Field key={i} label={q.question} required={q.required}>
                      <textarea
                        required={q.required}
                        rows={2}
                        className={textareaClass}
                        value={q.answer}
                        onChange={(e) => {
                          const next = [...questionAnswers];
                          next[i] = { ...next[i], answer: e.target.value };
                          setQuestionAnswers(next);
                        }}
                      />
                    </Field>
                  ))}
                </div>
              )}

              {/* Cover + resume */}
              <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Documents</p>
                <Field label="Cover letter">
                  <textarea
                    placeholder="Why you're a great fit (optional)"
                    rows={3}
                    className={textareaClass}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </Field>
                <Field label="Resume" required>
                  <label
                    className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 transition-colors ${
                      resume
                        ? 'border-[#00d9a6]/40 bg-[#00d9a6]/5'
                        : 'border-dashed border-gray-200 bg-gray-50/80 hover:border-[#00d9a6]/40 hover:bg-[#00d9a6]/5'
                    }`}
                  >
                    {resume ? (
                      <FileText className="h-4 w-4 shrink-0 text-[#007a5c]" />
                    ) : (
                      <Upload className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                      {resume ? resume.name : 'Upload PDF resume'}
                    </span>
                    <span className="shrink-0 rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 ring-1 ring-gray-200">
                      PDF
                    </span>
                    <input
                      required
                      type="file"
                      accept=".pdf,application/pdf"
                      className="sr-only"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                    />
                  </label>
                </Field>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}
            </form>
          )}
        </div>

        {!success && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-3.5 sm:px-5">
            <button
              type="submit"
              form="apply-form"
              disabled={loading}
              className="h-11 w-full rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
              style={{ background: BRAND }}
            >
              {loading ? 'Submitting…' : 'Submit application'}
            </button>
            <p className="mt-2 text-center text-[10px] text-gray-400">
              Client name stays confidential until you advance.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
