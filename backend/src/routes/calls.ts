import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createCallSchema, updateCallSchema } from '../validations/activitySchemas.js';
import { getByCandidate, listScheduled, create, update, remove } from '../controllers/callController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/candidate/:candidateId', getByCandidate);
router.get('/scheduled', listScheduled);
router.post('/', validateBody(createCallSchema), create);
router.patch('/:id', validateBody(updateCallSchema), update);
router.delete('/:id', remove);

export default router;
