import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listClients } from '../controllers/clientController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listClients);

export default router;
