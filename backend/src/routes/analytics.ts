import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireStaff } from '../middleware/role.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';

const router = Router();

router.get('/dashboard', authMiddleware, requireStaff, getDashboardAnalytics);

export default router;
