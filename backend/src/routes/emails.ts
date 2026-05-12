import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getInboxThreadController,
  gmailSentProofController,
  listInboxThreadsController,
  listSentEmails,
  prepareInvite,
  sendEmailController,
  syncInboxController,
} from '../controllers/emailController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.post('/prepare-invite', prepareInvite);
router.post('/send', sendEmailController);
router.get('/sent', listSentEmails);
router.get('/sent/:emailLogId/gmail-proof', gmailSentProofController);
router.post('/inbox/sync', syncInboxController);
router.get('/inbox', listInboxThreadsController);
router.get('/inbox/thread/:threadId', getInboxThreadController);

export default router;

