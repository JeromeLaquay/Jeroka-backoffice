import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
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
router.get('/stats', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query('SELECT * FROM dashboard_stats WHERE company_id = $1', [req.user!.company_id]);
    const stats: DashboardStats | null = rows?.[0] || null;
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_STATS_ERROR',
        statusCode: 500
      }
    });
  }
}));

export interface DashboardStats {
  company_id: string
  total_clients: number
  total_messages: number
  total_invoices: number
  total_quotes: number

  new_clients_month: number
  new_messages_week: number
  new_invoices_month: number
  new_quotes_month: number

  total_clients_percentage: number
  total_messages_percentage: number
  total_invoices_percentage: number
  total_quotes_percentage: number

  revenue_6_months: any
  sales_distribution: any
  financial_evolution: any
  vat_due: any
  revenue_evolution: any
  expenses_evolution: any 
  
  recent_clients: any
  recent_messages: any
  recent_invoices: any
  recent_quotes: any
}


export default router;


