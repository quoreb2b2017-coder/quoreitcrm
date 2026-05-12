import { Router } from 'express';
import { register, login, refresh, logout, me, googleAuthUrl, googleCallback, logoutGoogle } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../utils/validate.js';
import { loginSchema, registerSchema } from '../validations/authSchemas.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.get('/google/url', authMiddleware, googleAuthUrl);
router.get('/google/callback', googleCallback);
router.post('/google/disconnect', authMiddleware, logoutGoogle);

export default router;
