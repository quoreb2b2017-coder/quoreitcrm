'use client';

import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  Send, X, Bold, Italic, List, Paperclip, ChevronDown,
  Sparkles, Underline, AlignLeft, Trash2, Maximize2,
  AlertCircle, ListOrdered, CheckCircle, Calendar, Video
} from 'lucide-react';

type EmailCandidate = {
  name?: string;
  email?: string;
  jobTitle?: string;
};

type EmailUser = {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
};

interface EmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: EmailCandidate;
  user: EmailUser;
}

const TEMPLATES = [
  {
    id: 'final-round',
    name: 'Final Round Invitation',
    subject: 'Next Steps: Final Interview for [JobTitle] | [Company]',
    body: 'Dear [CandidateName],<br><br>I am pleased to invite you to the final stage of our interview process for the <b>[JobTitle]</b> position at <b>[Company]</b>. The team was highly impressed with your previous performance.<br><br>This session will include meetings with our Lead Engineer and VP of Product. Please let me know your availability for a 60-minute session later this week.<br><br>Best regards,'
  },
  {
    id: 'offer-informal',
    name: 'Verbal Offer Confirmation',
    subject: 'Excellent News regarding [JobTitle] role at [Company]',
    body: 'Hi [CandidateName],<br><br>I have some fantastic news! The team has unanimously decided to extend an offer for you to join as our new <b>[JobTitle]</b>. We believe your background will be instrumental to our upcoming initiatives.<br><br>I will be sending the formal offer package shortly, but I wanted to share the good news personally first. Do you have a few minutes for a brief call to discuss the details?<br><br>Congratulations!'
  },
  {
    id: 'calibration',
    name: 'Talent Outreach',
    subject: 'Strategic Opportunity: [JobTitle] mandate for [Company]',
    body: 'Dear [CandidateName],<br><br>I am reaching out regarding a highly confidential <b>[JobTitle]</b> mandate we are managing for <b>[Company]</b>. Given your significant contributions to the field, your profile stood out during our market mapping phase.<br><br>I would value the chance to share some high-level details and get your perspective on the current landscape.<br><br>Best regards,'
  }
];

export function EmailDrawer({ isOpen, onClose, candidate, user }: EmailDrawerProps) {
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showBcc, setShowBcc] = useState(false);
  const [importance, setImportance] = useState<'normal' | 'high'>('normal');
  const [showTemplates, setShowTemplates] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [inviteAttachment, setInviteAttachment] = useState<{ filename: string; contentBase64: string; contentType: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<null | 'meet'>(null);
  const [inviteDate, setInviteDate] = useState<string>('');
  const [inviteTime, setInviteTime] = useState<string>('');
  const [inviteDuration, setInviteDuration] = useState<number>(30);
  const [inviteTitle, setInviteTitle] = useState<string>('');
  const [inviteLocation, setInviteLocation] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus editor on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => editorRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setInviteDate(`${yyyy}-${mm}-${dd}`);
    setInviteTime('10:00');
    setInviteTitle(`Interview — ${candidate?.name ?? 'Candidate'}${candidate?.jobTitle ? ` (${candidate.jobTitle})` : ''}`);
    setInviteLocation(user?.company ? `${user.company}` : '');
  }, [isOpen, candidate?.name, candidate?.jobTitle, user?.company]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Close template menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    const s = tpl.subject
      .replace('[JobTitle]', candidate?.jobTitle || 'the role')
      .replace('[Company]', user?.company || 'our client');

    const b = tpl.body
      .replace('[CandidateName]', candidate?.name?.split(' ')[0] || 'there')
      .replace('[JobTitle]', candidate?.jobTitle || 'the role')
      .replace('[Company]', user?.company || 'our client');

    setSubject(s);
    if (editorRef.current) {
      editorRef.current.innerHTML = b;
    }
    setShowTemplates(false);
  };

  const execCmd = (cmd: string, value?: string) => {
    try {
      const ok = document.execCommand(cmd, false, value);
      editorRef.current?.focus();
      return ok;
    } catch {
      editorRef.current?.focus();
      return false;
    }
  };

  const buildStartEndIso = () => {
    const startLocal = new Date(`${inviteDate}T${inviteTime}:00`);
    const endLocal = new Date(startLocal.getTime() + Math.max(10, inviteDuration) * 60 * 1000);
    return { startAt: startLocal.toISOString(), endAt: endLocal.toISOString() };
  };

  const normalizeMeetUrl = (u: string) => {
    const s = String(u ?? '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    return `https://${s}`;
  };

  const insertMeetBlock = (url: string) => {
    const meetUrl = normalizeMeetUrl(url);
    if (!meetUrl) return;
    const html = `<br>
      <div contenteditable="false" style="display:block; margin: 4px 0 10px 0; user-select: text;">
        <a href="${meetUrl}" target="_blank" rel="noopener noreferrer" style="color: #0b5bd3; text-decoration: none; font-weight: 800; padding: 10px 14px; background: #e8f0fe; border-radius: 10px; display: inline-flex; align-items: center; gap: 10px; border: 1px solid #d6e4ff;">
          <span style="display:inline-flex;width:18px;height:18px;border-radius:4px;background:#0b5bd3;color:#fff;align-items:center;justify-content:center;font-size:12px;font-weight:900;">M</span>
          Join Google Meet
        </a>
        <div style="margin-top:6px; font-size:12px; font-weight:700; color:#334155;">
          Meeting link:
          <a href="${meetUrl}" target="_blank" rel="noopener noreferrer" style="color:#0b5bd3; text-decoration: underline; word-break: break-all;">
            ${meetUrl}
          </a>
        </div>
      </div>
      <br>`;
    const ok = execCmd('insertHTML', html);
    if (!ok && editorRef.current) {
      editorRef.current.insertAdjacentHTML('beforeend', html);
      editorRef.current.focus();
    }
  };

  const insertCalendarBlock = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const when = `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const html = `<br><div style="padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff; display: inline-block;"><div style="font-weight: 900; color: #111827; margin-bottom: 2px;">Calendar invite attached</div><div style="color:#6b7280; font-weight:600;">${when}</div></div><br>`;
    const ok = execCmd('insertHTML', html);
    if (!ok && editorRef.current) {
      editorRef.current.insertAdjacentHTML('beforeend', html);
      editorRef.current.focus();
    }
  };

  const openInviteModal = () => setShowInviteModal('meet');

  const createInvite = async () => {
    setInviteLoading(true);
    try {
      const { startAt, endAt } = buildStartEndIso();
      const resp = await api.emails.prepareInvite({
        summary: inviteTitle || 'Meeting',
        description: `Candidate: ${candidate?.name ?? ''}${candidate?.email ? ` (${candidate.email})` : ''}`,
        location: inviteLocation || undefined,
        startAt,
        endAt,
        createMeet: true,
      });
      const data = (resp.data as any)?.data;
      if (!data?.icsBase64) throw new Error('Invite generation failed');

      setInviteAttachment({
        filename: data.icsFilename ?? 'invite.ics',
        contentBase64: data.icsBase64,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
      });

      insertCalendarBlock(startAt, endAt);

      if (data.meetLink) {
        insertMeetBlock(data.meetLink);
      }

      setToast('Meet + Calendar invite added');
      setShowInviteModal(null);
    } catch (e: unknown) {
      const err = e as any;
      setToast(err?.response?.data?.error?.message ?? err?.message ?? 'Failed to create invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<{ filename: string; contentBase64: string; contentType?: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result ?? '');
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve({ filename: file.name, contentBase64: base64, contentType: file.type || undefined });
      };
      reader.onerror = () => reject(new Error('Failed to read attachment'));
      reader.readAsDataURL(file);
    });

  const handleSend = async () => {
    if (!subject) return;
    const to = candidate?.email;
    if (!to) {
      setToast('Candidate email not found');
      return;
    }
    setIsSending(true);
    try {
      const html = editorRef.current?.innerHTML?.trim() || '';
      const fileAttachments = await Promise.all(attachments.map(fileToBase64));
      const allAttachments = [
        ...fileAttachments,
        ...(inviteAttachment ? [inviteAttachment] : []),
      ];

      await api.emails.send({
        to,
        subject,
        html,
        from: user?.email,
        attachments: allAttachments,
      });
      setToast('Email sent successfully');
      setTimeout(() => onClose(), 400);
    } catch (e: unknown) {
      const err = e as any;
      setToast(err?.response?.data?.error?.message ?? err?.message ?? 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this draft?')) {
      setSubject('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setAttachments([]);
      onClose();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed top-[100px] inset-x-0 bottom-0 z-[110] flex justify-end animate-in fade-in duration-300">
      {/* Background overlay with onClose handler */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px]" onClick={onClose} />

      {/* Content wrapper with stopPropagation to prevent auto-hide */}
      <div
        className="relative w-full lg:max-w-[850px] bg-[#f8f9fa] shadow-[-40px_0_100px_rgba(0,0,0,0.3)] h-full flex flex-col animate-in slide-in-from-right duration-500 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlook Pro Header */}
        <div className="flex-none bg-[#0078d4] text-white flex items-center justify-between px-4 h-[50px] shadow-lg z-50">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded cursor-pointer transition-colors">
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-white" />)}
              </div>
            </div>
            <div className="h-5 w-px bg-white/20" />
            <h1 className="text-sm font-semibold tracking-tight">Outlook</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors active:scale-95">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Command Ribbon (Professional Desktop Style) */}
        <div className="flex-none bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleSend}
              disabled={isSending || !subject}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#0078d4] text-white rounded text-xs font-bold hover:bg-[#106ebe] transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
              <span className="sm:hidden">Send</span>
            </button>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
              title="Discard"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 sm:mx-2" />
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <button
                onClick={handleAttachClick}
                className="flex items-center gap-2 px-2 sm:px-4 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
                title="Attach"
              >
                <Paperclip className="h-4 w-4" />
                <span className="hidden md:inline">Attach</span>
              </button>
              <button onClick={() => setShowBcc(!showBcc)} className={`px-2 sm:px-4 py-2 text-xs font-medium rounded transition-colors ${showBcc ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                Bcc
              </button>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1 sm:mx-2" />
            <div className="flex items-center gap-1">
              <button
                onClick={openInviteModal}
                className="flex items-center gap-2 px-2 sm:px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded text-xs font-bold transition-colors"
                title="Add Google Meet + calendar invite"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Add Meet</span>
              </button>
            </div>
          </div>

          <div className="relative" ref={templateMenuRef}>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap ${showTemplates ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${showTemplates ? 'text-white' : 'text-indigo-500'}`} />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`} />
            </button>

            {showTemplates && (
              <div className="absolute top-full right-0 mt-1 w-[280px] sm:w-[320px] bg-white border border-slate-200 shadow-2xl rounded-lg z-[110] animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Templates</p>
                </div>
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex flex-col gap-0.5 group"
                  >
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{tpl.name}</span>
                    <span className="text-[11px] text-slate-500 truncate">{tpl.subject}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Address Bar (Compact & Professional) */}
        <div className="flex-none bg-white p-4 sm:p-6 space-y-3 sm:space-y-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="w-10 text-[11px] font-bold text-slate-400 uppercase sm:text-right hidden sm:block">From</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="px-3 py-1.5 bg-slate-100 rounded text-xs sm:text-sm text-slate-700 font-medium flex items-center gap-2 border border-slate-200/50 hover:bg-slate-200/50 transition-colors cursor-default max-w-full overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-[#0078d4] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{user?.name} &lt;{user?.email || 'user@outlook.com'}&gt;</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="w-10 text-[11px] font-bold text-slate-400 uppercase sm:text-right hidden sm:block">To</span>
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-[#f3f6fc] text-slate-900 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 border border-blue-100 group shadow-sm max-w-full overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {candidate?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{candidate?.name}</span>
                <X className="h-3 w-3 text-slate-400 hover:text-red-500 ml-1 cursor-pointer transition-colors shrink-0" />
              </div>
            </div>
          </div>

          {showBcc && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-top-1">
              <span className="w-10 text-[11px] font-bold text-slate-400 uppercase sm:text-right hidden sm:block">Bcc</span>
              <input type="text" placeholder="Add secret recipients" className="flex-1 bg-transparent border-b border-slate-200 outline-none text-sm py-1 focus:border-blue-500 transition-colors" />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 pt-1 sm:pt-2">
            <span className="w-10 text-[11px] font-bold text-slate-400 uppercase sm:text-right hidden sm:block">Subject</span>
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message Subject..."
                className="w-full bg-transparent border-none text-sm sm:text-base font-black text-slate-900 outline-none placeholder:text-slate-200"
              />
              <button
                onClick={() => setImportance(importance === 'high' ? 'normal' : 'high')}
                className={`p-2 transition-all shrink-0 ${importance === 'high' ? 'text-red-600 bg-red-50 rounded-lg' : 'text-slate-200 hover:text-slate-400 font-bold'}`}
              >
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 sm:pt-2 animate-in fade-in slide-in-from-top-1">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 shadow-sm group">
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                  <button onClick={() => removeAttachment(index)} className="hover:text-red-500 transition-colors ml-1 p-0.5 hover:bg-red-50 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Editor Container */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          {/* Editor Toolbar (Outlook Style) */}
          <div className="flex-none px-3 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-auto">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 sm:pr-4">
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Bold"><Bold className="h-4 w-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Italic"><Italic className="h-4 w-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Underline"><Underline className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 sm:pr-4 shrink-0">
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Align Left"><AlignLeft className="h-4 w-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Bullets"><List className="h-4 w-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded text-slate-600" title="Numbering"><ListOrdered className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 sm:pr-4 shrink-0">
              <button onClick={openInviteModal} className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-600 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors" title="Create Google Meet + calendar invite">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Add Meet</span>
              </button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit Mode</span>
              <div className="w-2 h-2 rounded-full bg-[#0078d4] shadow-[0_0_8px_rgba(0,120,212,0.4)]" />
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-12 sm:py-10 bg-white">
            <div
              ref={editorRef}
              contentEditable
              role="textbox"
              className="w-full min-h-[300px] sm:min-h-[400px] text-sm sm:text-lg leading-relaxed text-slate-800 outline-none prose max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-200"
              data-placeholder="Type your message here..."
            />

            {/* Professional Signature Block */}
            <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col gap-1 select-none grayscale-[0.5] hover:grayscale-0 transition-all duration-500">
              <h4 className="text-base font-bold text-slate-900">{user?.name || 'Recruiter'}</h4>
              <p className="text-sm font-medium text-slate-500">{user?.role === 'admin' ? 'Strategic Talent Lead' : 'Senior Recruiter'} at {user?.company || 'Agency Name'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[11px] font-bold text-[#0078d4] uppercase tracking-widest">{user?.company || 'The Agency'}</span>
                {importance === 'high' && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-[10px] font-bold text-red-700 rounded border border-red-200">High Support Priority</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer (Standard Desktop Style) */}
        <div className="flex-none h-[32px] sm:h-[40px] bg-[#f3f2f1] border-t border-slate-200 flex items-center justify-between px-3 sm:px-6 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
              <span className="hidden sm:inline">Connection Secure</span>
              <span className="sm:hidden">Secure</span>
            </span>
            <span className="truncate">Draft Saved: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-slate-500 hidden sm:inline">HTML Format</span>
            <span className="text-slate-500 sm:hidden">HTML</span>
            <Maximize2 className="h-3 w-3 hover:text-[#0078d4] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="absolute inset-0 z-[140] flex items-center justify-center px-4" onClick={() => setShowInviteModal(null)}>
          <div className="w-full max-w-[520px] rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Meeting details</div>
                <div className="text-lg font-black text-slate-900">
                  Add Meet + Calendar
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">
                  This will attach an <span className="font-bold">.ics</span> invite and insert a clean block into the email.
                </div>
              </div>
              <button onClick={() => setShowInviteModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Title</label>
                <input value={inviteTitle} onChange={(e) => setInviteTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</label>
                <input type="date" value={inviteDate} onChange={(e) => setInviteDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</label>
                <input type="time" value={inviteTime} onChange={(e) => setInviteTime(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration (min)</label>
                <input type="number" min={10} max={240} value={inviteDuration} onChange={(e) => setInviteDuration(Number(e.target.value || 30))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</label>
                <input value={inviteLocation} onChange={(e) => setInviteLocation(e.target.value)} placeholder="Google Meet" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setShowInviteModal(null)} className="px-4 py-2 rounded-xl text-sm font-black text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={createInvite}
                disabled={inviteLoading || !inviteTitle || !inviteDate || !inviteTime}
                className="px-5 py-2 rounded-xl bg-[#0078d4] text-white text-sm font-black hover:bg-[#106ebe] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Adding…' : 'Add Meet + Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}
