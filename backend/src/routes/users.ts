import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin, requireOwnProfile, requireRole } from '../middleware/role.js';
import { validateBody } from '../utils/validate.js';
import { createUserSchema, updateProfileSchema } from '../validations/authSchemas.js';
import { getProfile, listRecruiters, createUser, getRoleCounts, updateProfile, listUsers } from '../controllers/userController.js';

const router = Router();

router.use(authMiddleware);

router.get('/recruiters', requireAdmin, listRecruiters);
router.get('/stats', requireAdmin, getRoleCounts);
// RBAC: recruiter → own profile only; admin → any profile
router.get('/:id', requireOwnProfile('id'), getProfile);
router.patch('/:id', requireOwnProfile('id'), validateBody(updateProfileSchema), updateProfile);
// Only admin can add users (recruiters)
router.post('/', requireAdmin, validateBody(createUserSchema), createUser);
// Only admin can list all users
router.get('/', requireAdmin, listUsers);

export default router;
