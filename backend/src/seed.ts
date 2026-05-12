/**
 * Seed test users, jobs, and applications for dashboard analytics
 * Run: npm run seed (with MongoDB running and .env set)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
import { Job } from './models/Job.js';
import { Tag } from './models/Tag.js';

const SEED_USERS = [
  { email: 'admin@ats.com', password: 'Admin@123', name: 'Admin User', role: 'admin' as const },
  { email: 'recruiter@ats.com', password: 'Recruiter@123', name: 'Recruiter User', role: 'recruiter' as const },
];

async function seed() {
  await connectDb();

  const userIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    try {
      const doc = await User.create({
        email: u.email,
        password: passwordHash,
        name: u.name,
        role: u.role,
      });
      userIds[u.email] = doc._id;
      console.log(`[Seed] Created: ${u.email} (${u.role})`);
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) {
        const existing = await User.findOne({ email: u.email }).select('_id').lean();
        if (existing) userIds[u.email] = existing._id;
        console.log(`[Seed] Exists: ${u.email}`);
      } else {
        throw err;
      }
    }
  }

  const recruiterId = userIds['recruiter@ats.com'];

  const jobIds: mongoose.Types.ObjectId[] = [];
  const existingJobs = await Job.countDocuments();
  if (existingJobs === 0 && recruiterId) {
    const jobs = await Job.insertMany([
      { title: 'Senior Frontend Engineer', description: 'React & TypeScript', skills: ['React', 'TypeScript'], salary: '120k-150k', location: 'Remote', recruiterId, status: 'published' },
      { title: 'Backend Developer', description: 'Node.js APIs', skills: ['Node.js', 'MongoDB'], salary: '100k-130k', location: 'NYC', recruiterId, status: 'published' },
      { title: 'Full Stack Engineer', description: 'Full stack role', skills: ['React', 'Node.js'], salary: '110k-140k', location: 'Remote', recruiterId, status: 'draft' },
    ]);
    jobIds.push(...jobs.map((j) => j._id));
    console.log(`[Seed] Created ${jobs.length} jobs`);
  }

  const defaultTags = [
    { name: 'Interested', color: '#22c55e' },
    { name: 'Follow Up', color: '#3b82f6' },
    { name: 'Rejected', color: '#ef4444' },
    { name: 'Interview Scheduled', color: '#a855f7' },
    { name: 'High Priority', color: '#f97316' },
  ];
  const existingTags = await Tag.countDocuments();
  if (existingTags === 0) {
    await Tag.insertMany(defaultTags);
    console.log(`[Seed] Created ${defaultTags.length} default tags`);
  }

  console.log('\n[Seed] Done. Use these credentials to sign in:\n');
  SEED_USERS.forEach((u) => console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${u.password}`));
  console.log('');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
