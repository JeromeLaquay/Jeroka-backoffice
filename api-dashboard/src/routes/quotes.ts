import { Router } from 'express';
import { verifyToken } from '@/middleware/auth';

const router = Router();

// All quote routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/quotes
 * @desc Get all quotes
 * @access Private
 */
router.get('/', async (req, res) => {
  // TODO: Implement quote listing
  res.json({
    success: true,
    message: 'Quotes listing endpoint - à implémenter',
    data: []
  });
});

export default router;


