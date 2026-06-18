'use client';

const BRAND = '#00d9a6';

function HighlightItem({ label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex flex-col sm:inline-flex sm:flex-row sm:items-baseline sm:gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#007a5c]">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-900 border-b border-gray-200 pb-2 mb-4">
      {children}
    </h2>
  );
}

function BulletList({ items, dotClass = 'bg-[#00d9a6]' }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2.5 pl-0 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] text-gray-700 leading-relaxed">
          <span className={`shrink-0 mt-2 h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function JobDetailContent({ job, compact = false }) {
  const whatYoullDoBlocks = (job.whatYoullDo || '')
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);

  const highlights = [
    job.salary && { label: 'Compensation', value: job.salary },
    job.experience && { label: 'Experience', value: job.experience },
    (job.workplaceType || job.jobType) && { label: 'Work policy', value: job.workplaceType || job.jobType },
    job.visa && { label: 'Visa', value: job.visa },
    job.reportsTo && { label: 'Reports to', value: job.reportsTo },
    job.interviewProcess && { label: 'Interview', value: job.interviewProcess },
  ].filter(Boolean);

  return (
    <article className={compact ? 'space-y-8' : 'space-y-10'}>
      {/* Header */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#007a5c] mb-3">
          Confidential · Posted by Quore IT
        </p>
        <h1
          className={`font-bold text-gray-900 tracking-tight leading-tight ${
            compact ? 'text-2xl' : 'text-3xl md:text-[2rem]'
          }`}
        >
          {job.title}
        </h1>
        <p className="mt-2 text-base text-gray-500">
          {[job.roleType, job.location, job.workplaceType].filter(Boolean).join(' · ') || 'Open position'}
        </p>
      </header>

      {/* Key highlights — single bar, no cards */}
      {highlights.length > 0 && (
        <div className="border-l-4 border-[#00d9a6] bg-[#00d9a6]/[0.06] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
            {highlights.map((h) => (
              <HighlightItem key={h.label} label={h.label} value={h.value} />
            ))}
          </div>
        </div>
      )}

      {job.description && (
        <section>
          <SectionTitle>About the role</SectionTitle>
          <div className="text-[15px] text-gray-700 leading-[1.75] whitespace-pre-wrap">{job.description}</div>
        </section>
      )}

      {whatYoullDoBlocks.length > 0 && (
        <section>
          <SectionTitle>What you&apos;ll do</SectionTitle>
          <div className="space-y-5">
            {whatYoullDoBlocks.map((block, i) => {
              const [title, ...rest] = block.split('\n');
              const body = rest.join('\n').trim();
              return (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1">{title}</h3>
                  {body && <p className="text-[15px] text-gray-600 leading-[1.75]">{body}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {job.requirements?.length > 0 && (
        <section>
          <SectionTitle>Must have</SectionTitle>
          <BulletList items={job.requirements} dotClass="bg-emerald-600" />
        </section>
      )}

      {(job.niceToHave?.length > 0 || job.benefits?.length > 0) && (
        <section>
          <SectionTitle>Nice to have</SectionTitle>
          <BulletList items={job.niceToHave || job.benefits} dotClass="bg-sky-600" />
        </section>
      )}

      {job.notAFit?.length > 0 && (
        <section>
          <SectionTitle>Not a fit if</SectionTitle>
          <BulletList items={job.notAFit} dotClass="bg-gray-300" />
        </section>
      )}

      {job.skills?.length > 0 && (
        <section>
          <SectionTitle>Focus areas</SectionTitle>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            {job.skills.join(' · ')}
          </p>
        </section>
      )}
    </article>
  );
}

export { BRAND };
