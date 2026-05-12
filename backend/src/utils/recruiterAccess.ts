import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';

/**
 * Get job IDs assigned to this recruiter. Admin should not use this for filtering.
 *
 * By default returns only jobs the recruiter has *accepted* — the strictest scope
 * and what the dashboard / analytics views should use so a recruiter's numbers
 * never include another recruiter's pipeline.
 *
 * Pass `includeStatuses` to widen the scope (e.g. include 'pending' if you
 * want pending invitations to show up too).
 */
export async function getRecruiterJobIds(
  recruiterId: string,
  includeStatuses: Array<'accepted' | 'pending' | 'requested' | 'rejected'> = ['accepted']
): Promise<mongoose.Types.ObjectId[]> {
  const oId = new mongoose.Types.ObjectId(recruiterId);
  const jobs = await Job.find({
    recruiterAssignments: {
      $elemMatch: { recruiterId: oId, status: { $in: includeStatuses } },
    },
  })
    .select('_id')
    .lean();
  return jobs.map((j) => j._id);
}

/** Recruiter can only access candidate if candidate has an application to one of recruiter's jobs. */
export async function canRecruiterAccessCandidate(
  candidateId: string,
  recruiterId: string
): Promise<boolean> {
  const jobIds = await getRecruiterJobIds(recruiterId);
  if (jobIds.length === 0) return false;
  const exists = await Application.findOne({
    candidateId: new mongoose.Types.ObjectId(candidateId),
    jobId: { $in: jobIds },
  })
    .select('_id')
    .lean();
  return !!exists;
}
