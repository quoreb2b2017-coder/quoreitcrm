export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col justify-between bg-[#0f172a] px-12 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-500">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">QuoreIt</span>
          <span className="text-[10px] font-semibold text-blue-400/70 border border-blue-500/25 rounded-full px-2 py-0.5">CRM</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Recruiter CRM & ATS
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
              Hire faster,<br />
              <span className="text-blue-400">smarter.</span>
            </h1>
            <p className="text-[15px] text-slate-400 leading-relaxed">
              Manage candidates, clients, and hiring pipelines in one place. Built for modern recruitment teams.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              'Kanban pipeline boards',
              'Candidate tracking & notes',
              'Client & job management',
              'Real-time messaging',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
                  <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] text-slate-400">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} QuoreIt. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-5 py-10 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-blue-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-[16px] font-bold text-[var(--foreground)]">QuoreIt</span>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
