import { apiService } from './api'

export interface DashboardStats {
  clients: {
    total: number
    newThisMonth: number
  }
  messages: {
    unread: number
  }
  quotes: {
    pending: number
  }
  invoices: {
    overdue: number
  }
  revenue: {
    thisMonth: number
  }
  publications: {
    published: number
  }
}

export interface RecentActivity {
  recentClients: Array<{
    id: string
    name: string
    company?: string
    type: 'individual' | 'company'
    createdAt: string
    avatar_url?: string
  }>
  recentMessages: Array<{
    id: string
    name: string
    email: string
    subject: string
    type: string
    read: boolean
    createdAt: string
  }>
  recentInvoices: Array<{
    id: string
    number: string
    client: string
    amount: string
    status: string
    createdAt: string
  }>
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.getDashboardStats()
      
      if (response.success && response.data) {
        return response.data as DashboardStats
      }
      
      // Données de fallback si l'API n'est pas accessible
      return this.getFallbackStats()
    } catch (error) {
      console.warn('Erreur lors de la récupération des statistiques, utilisation des données de fallback')
      return this.getFallbackStats()
    }
  }

  async getRecentActivity(): Promise<RecentActivity> {
    try {
      const response = await apiService.getRecentActivity()
      
      if (response.success && response.data) {
        return response.data as RecentActivity
      }
      
      // Données de fallback si l'API n'est pas accessible
      return this.getFallbackActivity()
    } catch (error) {
      console.warn('Erreur lors de la récupération de l\'activité récente, utilisation des données de fallback')
      return this.getFallbackActivity()
    }
  }

  private getFallbackStats(): DashboardStats {
    return {
      clients: {
        total: 247,
        newThisMonth: 12
      },
      messages: {
        unread: 5
      },
      quotes: {
        pending: 8
      },
      invoices: {
        overdue: 3
      },
      revenue: {
        thisMonth: 15420.50
      },
      publications: {
        published: 23
      }
    }
  }

  private getFallbackActivity(): RecentActivity {
    return {
      recentClients: [
        {
          id: '1',
          name: 'Marie Dubois',
          company: 'Tech Solutions SARL',
          type: 'company',
          createdAt: 'Il y a 2 jours',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Pierre Martin',
          company: 'Design Studio',
          type: 'company',
          createdAt: 'Il y a 3 jours',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      ],
      recentMessages: [
        {
          id: '1',
          name: 'Alice Moreau',
          email: 'alice.moreau@exemple.fr',
          subject: 'Demande de devis pour site web',
          type: 'devis',
          read: false,
          createdAt: 'Il y a 2h'
        },
        {
          id: '2',
          name: 'Thomas Dupont',
          email: 'thomas.dupont@tech.fr',
          subject: 'Information sur l\'automatisation',
          type: 'information',
          read: false,
          createdAt: 'Il y a 4h'
        }
      ],
      recentInvoices: [
        {
          id: '1',
          number: 'FA24-0001',
          client: 'Tech Solutions',
          amount: '2 450,00 €',
          status: 'paid',
          createdAt: 'Il y a 1 jour'
        },
        {
          id: '2',
          number: 'FA24-0002',
          client: 'Design Studio',
          amount: '1 890,00 €',
          status: 'pending',
          createdAt: 'Il y a 2 jours'
        }
      ]
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService


