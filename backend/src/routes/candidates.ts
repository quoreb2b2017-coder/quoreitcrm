import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createCandidateSchema, updateCandidateSchema } from '../validations/candidateSchemas.js';
import { list, create, getOne, update, remove, exportCandidates, getFilters, syncLinkedInPublic } from '../controllers/candidateController.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'recruiter'));

router.get('/', list);
router.get('/filters', getFilters);
router.get('/export', exportCandidates);
router.post('/:id/sync-linkedin', syncLinkedInPublic);
router.get('/:id', getOne);
router.post('/', validateBody(createCandidateSchema), create);
router.patch('/:id', validateBody(updateCandidateSchema), update);
router.delete('/:id', requireAdmin, remove);

export default router;
