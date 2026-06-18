/**
 * Seed a sample public job (Founding Growth Marketer — confidential client).
 * Run: cd backend && npx tsx src/seedPublicJob.ts
 */
import mongoose from 'mongoose';
import { config } from './config/index.js';
import { Job } from './models/Job.js';

const SAMPLE_JOB = {
  title: 'Founding Growth Marketer',
  companyName: 'GroundControl',
  companyLogo: '',
  description: `A YC-backed AI infrastructure company in advanced manufacturing is hiring its first Growth Marketer. The product helps aerospace and manufacturing teams complete critical workflows up to 10× faster — with live traction across contract manufacturers and OEMs in the US.

As Founding Growth Marketer, you will own everything from content creation to trade shows to pipeline generation — working directly with founders and having massive impact on company trajectory.`,
  salary: '$140K – $160K + Equity',
  location: 'San Mateo, CA',
  workplaceType: 'In-Office',
  roleType: 'Full-time · YC-Backed Startup',
  status: 'published' as const,
  skills: ['B2B Marketing', 'Pipeline Generation', 'Aerospace', 'Content', 'Events'],
  requirements: [
    '3+ years of B2B marketing experience for a technical product',
    'Proven track record building a B2B marketing engine from scratch',
    'Early-stage startup background — Seed to Series C',
    'Marketed to industrial, manufacturing, aerospace, or technical B2B sectors',
    'Managed lead gen campaigns with MQL-to-pipeline conversion tracking',
    'Experience supporting enterprise sales cycles',
    'Effectively leverages AI tools to multiply output and speed',
    'Highly execution-oriented with a builder mentality',
    'Located in the Bay Area or willing to relocate',
  ],
  benefits: [
    'Familiarity with AS9100 / aerospace quality compliance ecosystems',
    'Hands-on experience with HubSpot, Apollo, or similar GTM stacks',
    'Cross-functional experience working directly with founders',
  ],
  customFields: [
    {
      name: "What You'll Do",
      value: `Pipeline Generation
Build and execute lead generation campaigns to create consistent monthly pipeline across ICP segments.

Content Engine
Write and publish technical content — case studies, blog posts, and industry insights — for aerospace and manufacturing buyers.

Events & Trade Shows
Own strategy and execution for trade shows and industry events, generating measurable pipeline.

Sales Enablement
Create collateral including one-pagers, ROI calculators, and pitch decks for the sales team.

Website Optimization
Sharpen messaging and improve demo conversion rates on the company website.`,
    },
    { name: 'Visa', value: 'Not available' },
    { name: 'Reports To', value: 'Founder' },
    { name: 'Interview Process', value: '3-step process' },
    {
      name: 'Not a Fit',
      value: `Seeking a pure brand or strategist role with no execution
Experience solely at large companies with predefined marketing structures
Looking to manage a team rather than execute as an IC
A history of frequent job changes without clear progression`,
    },
  ],
  personalQuestions: [
    { question: 'Describe a B2B campaign you built from scratch and the pipeline results.', required: true },
    { question: 'Have you marketed to technical or industrial buyers before? Briefly explain.', required: false },
    { question: 'Are you located in the Bay Area or willing to relocate to San Mateo?', required: true },
  ],
  idealCandidate: {
    experience: '3+ years B2B',
    seniority: 'Mid-Senior',
    education: '',
  },
  stats: { totalCandidates: 0, interviewing: 0, openings: 1 },
};

async function main() {
  await mongoose.connect(config.mongodb.uri);
  const existing = await Job.findOne({ title: SAMPLE_JOB.title, companyName: SAMPLE_JOB.companyName }).lean();
  if (existing) {
    await Job.findByIdAndUpdate(existing._id, { ...SAMPLE_JOB, status: 'published' });
    console.log('Updated existing job:', existing._id.toString());
  } else {
    const job = await Job.create(SAMPLE_JOB);
    console.log('Created job:', job._id.toString());
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
