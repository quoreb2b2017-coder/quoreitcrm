import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createNoteSchema, updateNoteSchema } from '../validations/activitySchemas.js';
import { getByCandidate, create, update, remove } from '../controllers/noteController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.post('/', validateBody(createNoteSchema), create);
router.patch('/:noteId', validateBody(updateNoteSchema), update);
router.delete('/:noteId', remove);
router.get('/candidate/:candidateId', getByCandidate);

export default router;
