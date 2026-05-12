import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createTagSchema } from '../validations/activitySchemas.js';
import { list, create, remove } from '../controllers/tagController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/', list);
router.post('/', validateBody(createTagSchema), create);
router.delete('/:tagId', remove);

export default router;
