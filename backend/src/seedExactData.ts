import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Job } from './models/Job.js';
import { User } from './models/User.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

const exactJobs = [
  {
    companyName: 'Skadden, Arps,...',
    title: 'Corporate Mid to Senior-Level...',
    reward: '22.5% first year + bonus',
    salary: '$365K - $435K',
    requirements: Array(0).fill(''),
    status: 'published',
    idealCandidate: {
      seniority: '4 - 9 years of experience. The Corporate group is seeking mid-level and senior associates, generally from the class of 2021-2017.',
      experience: 'Candidates must have experience in M&A.',
      education: 'T-14 legal education is strongly preferred.'
    },
    daysAgo: 3
  },
  {
    companyName: 'Rimon',
    title: 'Entertainment Partner',
    reward: '20% first year + bonus',
    salary: '$400K - $750K',
    requirements: Array(14).fill(''),
    status: 'published',
    idealCandidate: { seniority: 'Partner level' },
    daysAgo: 4
  },
  {
    companyName: 'Rimon',
    title: 'Corporate Transactions Partner',
    reward: '20% first year + bonus',
    salary: '$400K - $750K',
    requirements: Array(17).fill(''),
    status: 'published',
    idealCandidate: { seniority: 'Partner level' },
    daysAgo: 5
  },
  {
    companyName: 'Nelson Mullins...',
    title: 'Commercial Litigation Partner',
    reward: '20% first year + bonus',
    salary: '$400K - $750K',
    requirements: Array(22).fill(''),
    status: 'published',
    idealCandidate: { seniority: 'Partner level' },
    daysAgo: 3
  },
  {
    companyName: 'Nelson Mullins...',
    title: 'Corporate/M&A Partner',
    reward: '20% first year + bonus',
    salary: '$400K - $750K',
    requirements: Array(20).fill(''),
    status: 'published',
    daysAgo: 3
  },
  {
    companyName: 'Rimon',
    title: 'Trusts & Estates Partner',
    reward: '20% first year + bonus',
    salary: '$400K - $750K',
    requirements: Array(16).fill(''),
    status: 'published',
    daysAgo: 18,
    interviewingCount: 1
  },
  {
    companyName: 'Moore & Van...',
    title: 'Financial Services Associate - Charlotte',
    reward: '20% first year + bonus',
    salary: '$225K - $390K',
    requirements: Array(8).fill(''),
    status: 'published',
    daysAgo: 19,
    rating: '3.50',
    hiringCount: '5+'
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const recruiters = await User.find({ role: 'recruiter' });
  if (recruiters.length === 0) {
    console.log('No recruiters found!');
    process.exit(1);
  }

  const recruiterIds = recruiters.map(r => r._id);
  const recruiterAssignments = recruiters.map(r => ({
    recruiterId: r._id,
    status: 'accepted',
    acceptedAt: new Date()
  }));

  // Clear existing exact ones if we want, or just insert
  // Actually, we'll just insert them.
  for (const data of exactJobs) {
    const acceptedDate = new Date();
    acceptedDate.setDate(acceptedDate.getDate() - data.daysAgo);

    recruiterAssignments.forEach(a => a.acceptedAt = acceptedDate);

    const job = new Job({
      title: data.title,
      description: 'Dummy description',
      companyName: data.companyName,
      reward: data.reward,
      salary: data.salary,
      status: data.status,
      requirements: data.requirements,
      idealCandidate: data.idealCandidate || {},
      recruiterIds: recruiterIds,
      recruiterAssignments: recruiterAssignments,
      stats: { openings: typeof (data as any).hiringCount === 'number' ? (data as any).hiringCount : 1, totalCandidates: 0, interviewing: (data as any).interviewingCount || 0 },
      updatedAt: acceptedDate,
      createdAt: acceptedDate
    });
    // Add dynamic rating/hiring if needed (they're not strictly in schema, maybe we handle in UI based on title)
    await job.save();
    console.log(`Inserted ${data.title}`);
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
