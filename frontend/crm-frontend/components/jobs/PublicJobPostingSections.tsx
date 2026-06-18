import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Globe,
  Camera,
  X,
  FileText,
  Target,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Shield,
  Users,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { JdPdfImport } from '@/components/jobs/JdPdfImport';

export const PUBLIC_FORM_STEPS = [
  { id: 1, label: 'Role basics', icon: Briefcase },
  { id: 2, label: 'Key details', icon: Target },
  { id: 3, label: 'Job description', icon: FileText },
  { id: 4, label: 'Apply & publish', icon: CheckCircle2 },
] as const;

export const pubInput =
  'w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15';

export const pubTextarea =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 resize-y';

export const pubLabel =
  'mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500';

type FormState = {
  title: string;
  companyName: string;
  companyLogo: string;
  location: string;
  salary: string;
  description: string;
  workplaceType: string;
  status: string;
  skills: string[];
  openings: number;
  personalQuestions: { question: string; required: boolean }[];
  roleType: string;
  visa: string;
  reportsTo: string;
  interviewProcess: string;
  whatYoullDo: string;
  mustHaveText: string;
  niceToHaveText: string;
  notAFitText: string;
  experience: string;
};

type SectionProps = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState & Record<string, unknown>>>;
  uploadingLogo: boolean;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addQuestion: () => void;
  updateQuestion: (idx: number, val: string) => void;
  removeQuestion: (idx: number) => void;
  toggleQuestionRequired: (idx: number) => void;
  onJdImport?: (fields: import('@/utils/parseJobDescription').ParsedJobFields) => void;
};

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  accent = 'emerald',
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  accent?: 'emerald' | 'slate';
}) {
  const accentCls =
    accent === 'emerald'
      ? 'border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white'
      : 'border-gray-100 bg-gray-50/50';
  const iconCls = accent === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600';

  return (
    <section className={`rounded-xl border p-4 ${accentCls}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function PublicJobStep1({ form, setForm, uploadingLogo, onLogoUpload, onJdImport }: SectionProps) {
  return (
    <div className="space-y-3 animate-in slide-in-from-right-3 duration-300">
      {onJdImport && <JdPdfImport onApply={onJdImport} accent="emerald" />}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-900">
        <span className="font-bold">Internal only:</span> Company name & logo are visible to your team only — never on the public website.
      </div>

      <SectionCard
        title="Client & branding"
        description="For your internal CRM records"
        icon={Building2}
        accent="slate"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="group relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm sm:mx-0">
            {form.companyLogo ? (
              <>
                <img src={form.companyLogo} alt="" className="h-full w-full object-contain p-3" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, companyLogo: '' }))}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-400">
                {uploadingLogo ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                ) : (
                  <Camera className="h-6 w-6" />
                )}
                <span className="text-[10px] font-semibold">Logo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={onLogoUpload}
              disabled={uploadingLogo}
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className={pubLabel}>
                <Building2 className="h-3 w-3" /> Company name (internal) *
              </label>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className={pubInput}
                placeholder="e.g. GroundControl"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Role overview"
        description="What candidates will see on quoreit.com/open-jobs"
        icon={Briefcase}
      >
        <div className="space-y-4">
          <div>
            <label className={pubLabel}>
              <Briefcase className="h-3 w-3" /> Job title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={pubInput}
              placeholder="e.g. Founding Growth Marketer"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={pubLabel}>
                <MapPin className="h-3 w-3" /> Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={pubInput}
                placeholder="e.g. San Mateo, CA"
              />
            </div>
            <div>
              <label className={pubLabel}>
                <DollarSign className="h-3 w-3" /> Compensation
              </label>
              <input
                value={form.salary}
                onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                className={pubInput}
                placeholder="e.g. $140K – $160K + Equity"
              />
            </div>
          </div>
          <div>
            <label className={pubLabel}>
              <Globe className="h-3 w-3" /> Work policy
            </label>
            <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
              {['On-site', 'Remote', 'Hybrid', 'In-Office'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, workplaceType: type }))}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    form.workplaceType === type
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function PublicJobStep2({ form, setForm, addSkill, removeSkill }: SectionProps) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right-3 duration-300">
      <SectionCard title="Role metadata" description="Shown as highlighted data points on the public JD" icon={Target}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={pubLabel}>Role type / subtitle</label>
            <input
              value={form.roleType}
              onChange={(e) => setForm((f) => ({ ...f, roleType: e.target.value }))}
              className={pubInput}
              placeholder="e.g. Full-time · YC-Backed Startup"
            />
          </div>
          <div>
            <label className={pubLabel}>Experience required</label>
            <input
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              className={pubInput}
              placeholder="e.g. 3+ years B2B"
            />
          </div>
          <div>
            <label className={pubLabel}>Visa sponsorship</label>
            <input
              value={form.visa}
              onChange={(e) => setForm((f) => ({ ...f, visa: e.target.value }))}
              className={pubInput}
              placeholder="e.g. Not available"
            />
          </div>
          <div>
            <label className={pubLabel}>Reports to</label>
            <input
              value={form.reportsTo}
              onChange={(e) => setForm((f) => ({ ...f, reportsTo: e.target.value }))}
              className={pubInput}
              placeholder="e.g. Founder"
            />
          </div>
          <div>
            <label className={pubLabel}>Interview process</label>
            <input
              value={form.interviewProcess}
              onChange={(e) => setForm((f) => ({ ...f, interviewProcess: e.target.value }))}
              className={pubInput}
              placeholder="e.g. 3-step process"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Focus areas" description="Skills & tags shown on the listing" icon={Sparkles}>
        <div className="mb-3 flex flex-wrap gap-2">
          {form.skills.length === 0 && (
            <p className="text-xs text-gray-400">No tags yet — add a few keywords.</p>
          )}
          {form.skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/60"
            >
              {s}
              <button type="button" onClick={() => removeSkill(s)} className="text-emerald-500 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            id="public-skill-input"
            className={pubInput}
            placeholder="Add tag and press Enter (e.g. B2B Marketing)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('public-skill-input') as HTMLInputElement;
              if (input?.value) {
                addSkill(input.value);
                input.value = '';
              }
            }}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

export function PublicJobStep3({ form, setForm }: SectionProps) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right-3 duration-300">
      <SectionCard
        title="About the role"
        description="Opening summary — do not mention client company name"
        icon={FileText}
      >
        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={pubTextarea}
          placeholder="A YC-backed AI infrastructure company is hiring its first Growth Marketer..."
        />
      </SectionCard>

      <SectionCard
        title="What you'll do"
        description="One responsibility per block — title on first line, details below"
        icon={ListChecks}
      >
        <textarea
          rows={7}
          value={form.whatYoullDo}
          onChange={(e) => setForm((f) => ({ ...f, whatYoullDo: e.target.value }))}
          className={pubTextarea}
          placeholder={'Pipeline Generation\nBuild and execute lead gen campaigns...\n\nContent Engine\nWrite technical content for buyers...'}
        />
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Must have" icon={CheckCircle2} accent="emerald">
          <textarea
            rows={8}
            value={form.mustHaveText}
            onChange={(e) => setForm((f) => ({ ...f, mustHaveText: e.target.value }))}
            className={pubTextarea}
            placeholder="One requirement per line"
          />
        </SectionCard>
        <SectionCard title="Nice to have" icon={Sparkles} accent="slate">
          <textarea
            rows={8}
            value={form.niceToHaveText}
            onChange={(e) => setForm((f) => ({ ...f, niceToHaveText: e.target.value }))}
            className={pubTextarea}
            placeholder="One item per line"
          />
        </SectionCard>
        <SectionCard title="Not a fit if" icon={Shield} accent="slate">
          <textarea
            rows={8}
            value={form.notAFitText}
            onChange={(e) => setForm((f) => ({ ...f, notAFitText: e.target.value }))}
            className={pubTextarea}
            placeholder="One reason per line"
          />
        </SectionCard>
      </div>
    </div>
  );
}

export function PublicJobStep4({
  form,
  setForm,
  addQuestion,
  updateQuestion,
  removeQuestion,
  toggleQuestionRequired,
}: SectionProps) {
  return (
    <div className="space-y-5 animate-in slide-in-from-right-3 duration-300">
      <SectionCard
        title="Application questions"
        description="Optional — shown in the apply drawer on the public site"
        icon={HelpCircle}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">Candidates answer these when applying.</p>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add question
          </button>
        </div>
        {form.personalQuestions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center">
            <HelpCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No custom questions — resume & cover letter only.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {form.personalQuestions.map((q, i) => (
              <div key={i} className="flex gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <span className="mt-2.5 text-xs font-bold text-emerald-600">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={q.question}
                    onChange={(e) => updateQuestion(i, e.target.value)}
                    className={pubInput}
                    placeholder="Your question..."
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={() => toggleQuestionRequired(i)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Required answer
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="shrink-0 self-start rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Publish settings" description="Control visibility on the public website" icon={Globe}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={pubLabel}>
              <Users className="h-3 w-3" /> Openings
            </label>
            <input
              type="number"
              min={1}
              value={form.openings}
              onChange={(e) => setForm((f) => ({ ...f, openings: parseInt(e.target.value, 10) || 1 }))}
              className={pubInput}
            />
          </div>
          <div>
            <label className={pubLabel}>Status</label>
            <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
              {[
                { id: 'open', label: 'Open (live)' },
                { id: 'closed', label: 'Closed' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s.id }))}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    form.status === s.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              <strong>Open</strong> = visible on quoreit.com/open-jobs
            </p>
          </div>
        </div>

        {/* Preview summary */}
        <div className="mt-5 rounded-xl border border-emerald-100 bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Preview</p>
          <p className="font-bold text-gray-900">{form.title || 'Job title'}</p>
          <p className="mt-1 text-xs text-gray-500">
            {[form.roleType, form.location, form.workplaceType].filter(Boolean).join(' · ') || 'Role details'}
          </p>
          {form.salary && <p className="mt-2 text-sm font-semibold text-emerald-700">{form.salary}</p>}
        </div>
      </SectionCard>
    </div>
  );
}
