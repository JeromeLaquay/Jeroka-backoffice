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
  
  recent_clients: any
  recent_messages: any
  recent_invoices: any
  recent_quotes: any
}

class DashboardService {
  async getStats(): Promise<any> {
    try {
      const response = await apiService.getDashboardStats()
      
      if (response.success && response.data) {
        return response.data
      }
      return {}
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques, utilisation des données de fallback')
      return {}
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService


