import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireStaff } from '../middleware/role.js';
import { validateQuery, validateBody } from '../utils/validate.js';
import {
  updateStageSchema,
  listApplicationsQuerySchema,
  addToPipelineSchema,
} from '../validations/applicationSchemas.js';
import { list, addToPipeline, updateStage, getApplicationResume } from '../controllers/applicationController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validateQuery(listApplicationsQuerySchema), list);
router.post('/add-to-pipeline', requireStaff, validateBody(addToPipelineSchema), addToPipeline);
router.patch('/:id/stage', requireStaff, validateBody(updateStageSchema), updateStage);
router.get('/:id/resume', requireStaff, getApplicationResume);

export default router;
