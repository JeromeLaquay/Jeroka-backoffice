import { apiService } from './api'

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

  recent_clients: any[]
  recent_messages: any[]
  recent_invoices: any[]
  recent_quotes: any[]
  monthly_revenue: { month: string; total: number }[]
  invoice_status_counts: Record<string, number>
}

function emptyStats(): DashboardStats {
  return {
    company_id: '',
    total_clients: 0,
    total_messages: 0,
    total_invoices: 0,
    total_quotes: 0,
    new_clients_month: 0,
    new_messages_week: 0,
    new_invoices_month: 0,
    new_quotes_month: 0,
    recent_clients: [],
    recent_messages: [],
    recent_invoices: [],
    recent_quotes: [],
    monthly_revenue: [],
    invoice_status_counts: {}
  }
}

class DashboardService {
  async getStats(): Promise<any> {
    try {
      const response = await apiService.getDashboardStats()
      if (response?.success && response?.data) {
        return response.data
      }
      if (response?.company_id != null || response?.total_clients != null) {
        return response
      }
      return emptyStats()
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques, utilisation des données de fallback')
      return emptyStats()
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService


