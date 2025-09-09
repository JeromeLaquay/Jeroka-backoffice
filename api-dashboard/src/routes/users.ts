import { Router } from 'express';
import { verifyToken, requireAdmin } from '@/middleware/auth';

const router = Router();

// All user routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/users
 * @desc Get all users (Admin only)
 * @access Private/Admin
 */
router.get('/', requireAdmin, async (req, res) => {
  // TODO: Implement user listing
  res.json({
    success: true,
    message: 'Users endpoint - à implémenter',
    data: []
  });
});

export default router;
