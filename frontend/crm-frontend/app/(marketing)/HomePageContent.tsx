'use client';

import Image from 'next/image';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';

// High-quality Unsplash images - hiring, recruitment, ATS theme (q=90)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=90';
const HOW_IT_WORKS_IMAGE = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=90';
// Card 01: team collaboration (reliable); cards 02–03 unchanged
const FEATURE_POST_JOB = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=90';
const FEATURE_CANDIDATES = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=90';
const FEATURE_HIRE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=90';
const CTA_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=90';

export function HomePageContent() {
  const authModal = useAuthModal();
  const processSteps = [
    {
      step: '01',
      title: 'Post your job',
      desc: 'Create a job listing in minutes. Publish to your board and start receiving applications.',
      img: FEATURE_POST_JOB,
      alt: 'Job posting and recruitment',
    },
    {
      step: '02',
      title: 'Review candidates',
      desc: 'Track applicants in one place. Screen resumes, add notes, and move candidates through your pipeline.',
      img: FEATURE_CANDIDATES,
      alt: 'Reviewing candidates',
    },
    {
      step: '03',
      title: 'Hire together',
      desc: 'Collaborate with your team. Role-based access keeps everyone aligned from first contact to offer.',
      img: FEATURE_HIRE,
      alt: 'Team hiring decision',
    },
  ];
  const trustItems = ['Role-based access', 'Secure & compliant', 'One dashboard', 'Fast setup'];
  const quickStats = [
    { value: '3x', label: 'Faster hiring flow' },
    { value: '100%', label: 'Team visibility' },
    { value: '24/7', label: 'Cloud availability' },
  ];

  const signInButton = authModal ? (
    <button type="button" onClick={authModal.openLogin} className="btn-primary px-8 py-4 text-base font-semibold shadow-lg">
      Sign in
    </button>
  ) : (
    <a href="/login" className="btn-primary px-8 py-4 text-base font-semibold shadow-lg">
      Sign in
    </a>
  );

  const bottomCtaSignIn = authModal ? (
    <button
      type="button"
      onClick={authModal.openLogin}
      className="inline-flex rounded-xl bg-white px-8 py-4 text-base font-semibold text-[var(--primary)] shadow-xl transition hover:bg-white/95 hover:shadow-2xl"
    >
      Sign in
    </button>
  ) : (
    <a
      href="/login"
      className="inline-flex rounded-xl bg-white px-8 py-4 text-base font-semibold text-[var(--primary)] shadow-xl transition hover:bg-white/95 hover:shadow-2xl"
    >
      Sign in
    </a>
  );

  return (
    <main className="gradient-mesh">
      {/* Hero - professional ATS headline + hiring imagery */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Applicant Tracking System
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl xl:text-[3.2rem]">
                Hire the best talent.{' '}
                <span className="text-[var(--primary)]">Faster.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
                Post jobs, track applicants, and collaborate with your team—all in one secure platform. Built for recruiters and hiring managers.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Smart pipeline', 'Live collaboration', 'Candidate notes'].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">{signInButton}</div>
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <p className="text-xl font-black tracking-tight text-[var(--foreground)]">{item.value}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl ring-1 ring-black/5 lg:aspect-[5/4]">
                <Image
                  src={HERO_IMAGE}
                  alt="Professional handshake - hiring and recruitment"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  quality={90}
                />
              </div>
              <div className="absolute -left-4 bottom-5 rounded-2xl border border-[var(--border)] bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm sm:-left-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Live pipeline</p>
                <p className="mt-1 text-sm font-black text-[var(--foreground)]">32 candidates in review</p>
              </div>
              <div className="absolute -right-2 top-5 rounded-2xl border border-blue-100 bg-blue-50/95 px-4 py-3 shadow-xl backdrop-blur-sm sm:-right-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">This week</p>
                <p className="mt-1 text-sm font-black text-blue-800">8 interviews scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / social proof strip */}
      <section className="border-y border-[var(--border)] bg-[var(--card)]/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Built for modern hiring teams
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustItems.map((item) => (
              <span key={item} className="text-sm font-medium text-[var(--foreground)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product highlights */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Collaborative workspace',
                desc: 'Hiring managers and recruiters can review, comment, and decide together.',
              },
              {
                title: 'Structured hiring stages',
                desc: 'Move candidates through clear pipeline stages with full visibility.',
              },
              {
                title: 'Reliable notifications',
                desc: 'Never miss a message with real-time alerts and role-aware routing.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - 3 steps with large image */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
              From posting a job to making the offer—streamline your entire hiring process.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {processSteps.map((item) => (
              <div key={item.step} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <ImageWithFallback
                    src={item.img}
                    alt={item.alt}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    quality={90}
                    fallbackLabel={item.title}
                  />
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white shadow">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us - full width image + text */}
      <section className="relative overflow-hidden bg-[var(--card)]">
        <div className="grid lg:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] lg:order-1 lg:aspect-auto lg:min-h-[480px]">
            <Image
              src={HOW_IT_WORKS_IMAGE}
              alt="Team collaboration on hiring"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 lg:order-2 lg:px-16 lg:py-24">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              One platform. Your entire hiring workflow.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
              Stop switching between spreadsheets and email. Our ATS gives you a single dashboard to post jobs, manage applicants, and collaborate with recruiters and hiring managers—with secure, role-based access built in.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Post jobs and manage applications', 'Track candidates through your pipeline', 'Role-based permissions (Admin, Recruiter)', 'Secure auth with JWT and cookies'].map((text) => (
                <li key={text} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA - professional full-bleed image */}
      <section className="relative min-h-[420px] overflow-hidden sm:min-h-[480px]">
        <Image
          src={CTA_BG}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-4 py-20 text-center sm:min-h-[480px] sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to hire with confidence?
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-white/90">
            Join teams who use ATS to fill roles faster. Sign in to your workspace to manage jobs, candidates, and your pipeline.
          </p>
          <div className="mt-10">{bottomCtaSignIn}</div>
        </div>
      </section>
    </main>
  );
}
