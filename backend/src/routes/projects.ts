import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createProjectSchema } from '../validations/projectSchemas.js';
import { list, create, remove } from '../controllers/projectController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/', list);
router.post('/', validateBody(createProjectSchema), create);
router.delete('/:id', remove);

export default router;
