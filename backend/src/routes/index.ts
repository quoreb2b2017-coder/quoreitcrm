import { Router } from 'express';
import authRoutes from './auth.js';
import uploadRoutes from './upload.js';
import jobRoutes from './jobs.js';
import userRoutes from './users.js';
import analyticsRoutes from './analytics.js';
import profileRoutes from './profile.js';
import applicationRoutes from './applications.js';
import notesRoutes from './notes.js';
import callsRoutes from './calls.js';
import tagsRoutes from './tags.js';
import timelineRoutes from './timeline.js';
import activityRoutes from './activity.js';
import projectRoutes from './projects.js';
import candidateRoutes from './candidates.js';
import clientRoutes from './clients.js';
import messageRoutes from './messages.js';
import emailRoutes from './emails.js';
import publicRoutes from './public.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/jobs', jobRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/profile', profileRoutes);
router.use('/applications', applicationRoutes);
router.use('/notes', notesRoutes);
router.use('/calls', callsRoutes);
router.use('/tags', tagsRoutes);
router.use('/timeline', timelineRoutes);
router.use('/activity', activityRoutes);
router.use('/projects', projectRoutes);
router.use('/candidates', candidateRoutes);
router.use('/clients', clientRoutes);
router.use('/messages', messageRoutes);
router.use('/emails', emailRoutes);
router.use('/public', publicRoutes);

// Example: admin-only route
router.get('/admin/stats', authMiddleware, requireAdmin, (_req, res) => {
  res.json({ success: true, data: { message: 'Admin-only data' } });
});

// Health check for Railway / load balancers
router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

export default router;
