import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { query } from '../database/connection';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All dashboard routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // Get dashboard statistics from the view
  const statsResult = await query('SELECT * FROM dashboard_stats');
  const stats = statsResult.rows[0] || {};

  res.json({
    success: true,
    data: {
      clients: {
        total: parseInt(stats.active_clients) || 0,
        newThisMonth: parseInt(stats.new_clients_month) || 0
      },
      messages: {
        unread: parseInt(stats.unread_messages) || 0
      },
      quotes: {
        pending: parseInt(stats.pending_quotes) || 0
      },
      invoices: {
        overdue: parseInt(stats.overdue_invoices) || 0
      },
      revenue: {
        thisMonth: parseFloat(stats.revenue_month) || 0
      },
      publications: {
        published: parseInt(stats.published_publications) || 0
      }
    }
  });
}));

/**
 * @route GET /api/v1/dashboard/recent-activity
 * @desc Get recent activity for dashboard
 * @access Private
 */
router.get('/recent-activity', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement recent activity aggregation
  
  res.json({
    success: true,
    data: {
      recentClients: [],
      recentMessages: [],
      recentInvoices: []
    }
  });
}));

export default router;


