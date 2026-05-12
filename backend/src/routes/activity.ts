import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { listCandidates } from '../controllers/activityController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/candidates', listCandidates);

export default router;
