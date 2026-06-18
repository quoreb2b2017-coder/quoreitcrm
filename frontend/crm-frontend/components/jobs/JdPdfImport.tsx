'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { parseJobDescriptionText, type ParsedJobFields } from '@/utils/parseJobDescription';

type JdPdfImportProps = {
  onApply: (fields: ParsedJobFields) => void;
  accent?: 'blue' | 'emerald';
};

export function JdPdfImport({ onApply, accent = 'blue' }: JdPdfImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const accentRing = accent === 'emerald' ? 'hover:border-emerald-400 focus-within:ring-emerald-500/20' : 'hover:border-blue-400 focus-within:ring-blue-500/20';
  const accentIcon = accent === 'emerald' ? 'text-emerald-600' : 'text-blue-600';
  const accentBg = accent === 'emerald' ? 'bg-emerald-50' : 'bg-blue-50';

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF job description');
      return;
    }
    setLoading(true);
    try {
      const res = await api.upload.parseJobDescription(file);
      const text = (res.data as { data?: { text?: string } })?.data?.text ?? '';
      if (!text.trim()) {
        toast.error('No text found in PDF');
        return;
      }
      const parsed = parseJobDescriptionText(text, file.name);
      onApply(parsed);
      toast.success('Fields filled from JD — review and edit before publishing');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to read PDF');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 ${accentBg}/40 px-3.5 py-2.5 transition-all focus-within:ring-2 ${accentRing}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ${accentIcon}`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-gray-800">Import from JD PDF</span>
        <span className="block text-[11px] text-gray-500">Text only — PDF is not saved</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-600 ring-1 ring-gray-200">
        <Upload className="h-3 w-3" />
        Upload
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        disabled={loading}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
