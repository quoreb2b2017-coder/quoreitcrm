import { Router } from 'express';
import { multerPublicResume } from '../middleware/upload.js';
import { listPublicJobs, getPublicJob, publicApply } from '../controllers/publicJobController.js';

const router = Router();

router.get('/jobs', listPublicJobs);
router.get('/jobs/:id', getPublicJob);
router.post('/applications/apply', multerPublicResume, publicApply);

export default router;
