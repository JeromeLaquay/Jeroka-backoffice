import { apiService } from './api'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  vatAmount: number
  vatRate: number
  date: string
  invoiceId?: string
  clientId?: string
  supplierId?: string
  reference?: string
  paymentMethod: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  vatOwed: number
  outstandingInvoices: number
  overdueInvoices: number
  cashFlow: number
  monthlyRevenue: { month: string; amount: number }[]
  monthlyExpenses: { month: string; amount: number }[]
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
}

export interface VatReport {
  period: string
  salesVat: number
  purchaseVat: number
  vatOwed: number
  transactions: Transaction[]
}

export interface ProfitLossReport {
  period: string
  revenue: {
    total: number
    breakdown: { category: string; amount: number }[]
  }
  expenses: {
    total: number
    breakdown: { category: string; amount: number }[]
  }
  grossProfit: number
  netProfit: number
  profitMargin: number
}

export interface CashFlowReport {
  period: string
  openingBalance: number
  closingBalance: number
  inflows: {
    total: number
    breakdown: { source: string; amount: number }[]
  }
  outflows: {
    total: number
    breakdown: { destination: string; amount: number }[]
  }
  netCashFlow: number
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  vatRate?: number
  date: string
  invoiceId?: string
  clientId?: string
  supplierId?: string
  reference?: string
  paymentMethod: string
  notes?: string
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  status?: string
}

export interface TransactionsListParams {
  page?: number
  limit?: number
  search?: string
  type?: 'income' | 'expense'
  category?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class AccountingService {
  /**
   * Récupérer le tableau de bord financier
   */
  async getFinancialDashboard(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.api.get('/accounting/dashboard', { params })
    return response.data
  }

  /**
   * Récupérer les statistiques financières
   */
  async getFinancialStats(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.api.get('/accounting/stats', { params })
    return response.data
  }

  /**
   * Récupérer les transactions avec filtres et pagination
   */
  async getTransactions(params: TransactionsListParams = {}) {
    const response = await apiService.api.get('/accounting/transactions', { params })
    return response.data
  }

  /**
   * Récupérer une transaction par son ID
   */
  async getTransaction(id: string) {
    const response = await apiService.api.get(`/accounting/transactions/${id}`)
    return response.data
  }

  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(data: CreateTransactionRequest) {
    const response = await apiService.api.post('/accounting/transactions', data)
    return response.data
  }

  /**
   * Mettre à jour une transaction
   */
  async updateTransaction(id: string, data: UpdateTransactionRequest) {
    const response = await apiService.api.put(`/accounting/transactions/${id}`, data)
    return response.data
  }

  /**
   * Supprimer une transaction
   */
  async deleteTransaction(id: string) {
    const response = await apiService.api.delete(`/accounting/transactions/${id}`)
    return response.data
  }

  /**
   * Importer des transactions depuis un fichier
   */
  async importTransactions(file: File, format: 'csv' | 'excel') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    
    const response = await apiService.api.post('/accounting/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Exporter les transactions
   */
  async exportTransactions(params: TransactionsListParams & { format: 'csv' | 'excel' | 'pdf' }) {
    const response = await apiService.api.get('/accounting/transactions/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Générer un rapport de TVA
   */
  async generateVatReport(period: string) {
    const response = await apiService.api.get('/accounting/reports/vat', {
      params: { period }
    })
    return response.data
  }

  /**
   * Générer un compte de résultat
   */
  async generateProfitLossReport(period: string) {
    const response = await apiService.api.get('/accounting/reports/profit-loss', {
      params: { period }
    })
    return response.data
  }

  /**
   * Générer un rapport de trésorerie
   */
  async generateCashFlowReport(period: string) {
    const response = await apiService.api.get('/accounting/reports/cash-flow', {
      params: { period }
    })
    return response.data
  }

  /**
   * Récupérer le bilan comptable
   */
  async getBalanceSheet(date?: string) {
    const params = date ? { date } : {}
    const response = await apiService.api.get('/accounting/reports/balance-sheet', { params })
    return response.data
  }

  /**
   * Récupérer les catégories de transactions
   */
  async getTransactionCategories() {
    const response = await apiService.api.get('/accounting/categories')
    return response.data
  }

  /**
   * Créer une nouvelle catégorie
   */
  async createCategory(data: { name: string; type: 'income' | 'expense'; description?: string }) {
    const response = await apiService.api.post('/accounting/categories', data)
    return response.data
  }

  /**
   * Récupérer les méthodes de paiement
   */
  async getPaymentMethods() {
    const response = await apiService.api.get('/accounting/payment-methods')
    return response.data
  }

  /**
   * Réconcilier les transactions bancaires
   */
  async reconcileTransactions(data: { bankStatementId: string; transactionIds: string[] }) {
    const response = await apiService.api.post('/accounting/reconcile', data)
    return response.data
  }

  /**
   * Calculer les taxes dues
   */
  async calculateTaxes(period: string) {
    const response = await apiService.api.get('/accounting/taxes', {
      params: { period }
    })
    return response.data
  }

  /**
   * Générer une déclaration de TVA
   */
  async generateVatDeclaration(period: string) {
    const response = await apiService.api.post('/accounting/vat-declaration', {
      period
    })
    return response.data
  }

  /**
   * Archiver les données comptables
   */
  async archiveData(year: number) {
    const response = await apiService.api.post('/accounting/archive', {
      year
    })
    return response.data
  }
}

export const accountingService = new AccountingService()
export default accountingService
