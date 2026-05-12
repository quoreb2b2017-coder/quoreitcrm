import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { listMessages, createMessage, listAssignedJobs, deleteMessage } from '../controllers/messageController.js';

const router = Router();

router.use(authMiddleware, requireRole('recruiter', 'admin'));

router.get('/jobs', listAssignedJobs);
router.get('/', listMessages);
router.post('/', createMessage);
router.delete('/:id', deleteMessage);

export default router;

