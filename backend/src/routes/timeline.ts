import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { getByCandidate } from '../controllers/timelineController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/candidate/:candidateId', getByCandidate);

export default router;
