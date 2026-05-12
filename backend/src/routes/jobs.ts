import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin, requireRole, requireStaff, requireJobAssignment } from '../middleware/role.js';
import { validateBody, validateQuery } from '../utils/validate.js';
import {
  createJobSchema,
  updateJobSchema,
  assignRecruitersSchema,
  listJobsQuerySchema,
} from '../validations/jobSchemas.js';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  assignRecruiters,
  acceptJob,
  rejectJob,
  requestJobAccess,
  approveJobAccess,
} from '../controllers/jobController.js';

const router = Router();

router.use(authMiddleware);

// List: admin sees all jobs; recruiter sees assigned jobs only
router.get('/', requireRole('admin', 'recruiter'), validateQuery(listJobsQuerySchema), listJobs);
router.get('/:id', requireRole('admin', 'recruiter'), requireJobAssignment, getJob);
// Admin only: create / edit / delete jobs, assign recruiter. Recruiter: view assigned only.
router.post('/', requireAdmin, validateBody(createJobSchema), createJob);
router.patch('/:id', requireAdmin, validateBody(updateJobSchema), updateJob);
router.delete('/:id', requireAdmin, requireJobAssignment, deleteJob);
router.patch('/:id/assign', requireAdmin, requireJobAssignment, validateBody(assignRecruitersSchema), assignRecruiters);
router.patch('/:id/accept', requireRole('recruiter'), requireJobAssignment, acceptJob);
router.patch('/:id/reject', requireRole('recruiter'), requireJobAssignment, rejectJob);
router.post('/:id/request', requireRole('recruiter'), requestJobAccess);
router.patch('/:id/approve/:recruiterId', requireAdmin, approveJobAccess);

export default router;
