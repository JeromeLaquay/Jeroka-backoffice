import { Router } from 'express';
import { verifyToken } from '@/middleware/auth';

const router = Router();

// All invoice routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/invoices
 * @desc Get all invoices
 * @access Private
 */
router.get('/', async (req, res) => {
  // TODO: Implement invoice listing
  res.json({
    success: true,
    message: 'Invoices listing endpoint - à implémenter',
    data: []
  });
});

export default router;


