import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
// Candidate profile routes removed – only admin and recruiter roles supported

export default router;
