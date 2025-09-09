import { apiService } from './api'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  position?: string
  department?: string
  isActive: boolean
  emailVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  id: string
  name: string
  legalName?: string
  industry?: string
  description?: string
  logo?: string
  website?: string
  email: string
  phone?: string
  address: {
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  taxSettings: {
    vatNumber?: string
    siretNumber?: string
    vatRate: number
    taxRegime?: string
  }
  bankingInfo?: {
    iban?: string
    bic?: string
    bankName?: string
  }
  invoiceSettings: {
    prefix: string
    startingNumber: number
    paymentTerms: number
    footerText?: string
    termsAndConditions?: string
  }
  quoteSettings: {
    prefix: string
    startingNumber: number
    validityDays: number
    footerText?: string
    termsAndConditions?: string
  }
  emailSettings: {
    smtpHost?: string
    smtpPort?: number
    smtpUsername?: string
    smtpPassword?: string
    fromEmail?: string
    fromName?: string
  }
  theme: {
    primaryColor: string
    logoPosition: 'left' | 'center' | 'right'
    showLogo: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface SystemSettings {
  id: string
  appName: string
  appVersion: string
  maintenance: {
    enabled: boolean
    message?: string
    scheduledAt?: string
  }
  backups: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention: number
    location: string
  }
  security: {
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
    maxLoginAttempts: number
    lockoutDuration: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
  }
  integrations: {
    stripe?: {
      enabled: boolean
      publicKey?: string
      secretKey?: string
    }
    paypal?: {
      enabled: boolean
      clientId?: string
      clientSecret?: string
    }
    mailchimp?: {
      enabled: boolean
      apiKey?: string
    }
  }
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  position?: string
  department?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateCompanyRequest extends Partial<Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface UpdateSystemRequest extends Partial<Omit<SystemSettings, 'id' | 'appVersion' | 'updatedAt'>> {}

class SettingsService {
  /**
   * Récupérer le profil utilisateur
   */
  async getUserProfile() {
    const response = await apiService.api.get('/settings/profile')
    return response.data
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateUserProfile(data: UpdateProfileRequest) {
    const response = await apiService.api.put('/settings/profile', data)
    return response.data
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(data: ChangePasswordRequest) {
    const response = await apiService.api.post('/settings/change-password', data)
    return response.data
  }

  /**
   * Activer/désactiver l'authentification à deux facteurs
   */
  async toggleTwoFactor(enabled: boolean) {
    const response = await apiService.api.post('/settings/two-factor', { enabled })
    return response.data
  }

  /**
   * Télécharger l'avatar
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiService.api.post('/settings/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Récupérer les paramètres de l'entreprise
   */
  async getCompanySettings() {
    const response = await apiService.api.get('/settings/company')
    return response.data
  }

  /**
   * Mettre à jour les paramètres de l'entreprise
   */
  async updateCompanySettings(data: UpdateCompanyRequest) {
    const response = await apiService.api.put('/settings/company', data)
    return response.data
  }

  /**
   * Télécharger le logo de l'entreprise
   */
  async uploadLogo(file: File) {
    const formData = new FormData()
    formData.append('logo', file)
    
    const response = await apiService.api.post('/settings/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Récupérer les paramètres système
   */
  async getSystemSettings() {
    const response = await apiService.api.get('/settings/system')
    return response.data
  }

  /**
   * Mettre à jour les paramètres système
   */
  async updateSystemSettings(data: UpdateSystemRequest) {
    const response = await apiService.api.put('/settings/system', data)
    return response.data
  }

  /**
   * Tester la configuration email
   */
  async testEmailConfig(emailSettings: any) {
    const response = await apiService.api.post('/settings/test-email', emailSettings)
    return response.data
  }

  /**
   * Créer une sauvegarde manuelle
   */
  async createBackup() {
    const response = await apiService.api.post('/settings/backup')
    return response.data
  }

  /**
   * Récupérer la liste des sauvegardes
   */
  async getBackups() {
    const response = await apiService.api.get('/settings/backups')
    return response.data
  }

  /**
   * Restaurer une sauvegarde
   */
  async restoreBackup(backupId: string) {
    const response = await apiService.api.post(`/settings/backup/${backupId}/restore`)
    return response.data
  }

  /**
   * Supprimer une sauvegarde
   */
  async deleteBackup(backupId: string) {
    const response = await apiService.api.delete(`/settings/backup/${backupId}`)
    return response.data
  }

  /**
   * Exporter les données
   */
  async exportData(format: 'json' | 'csv') {
    const response = await apiService.api.get('/settings/export', {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Importer les données
   */
  async importData(file: File) {
    const formData = new FormData()
    formData.append('data', file)
    
    const response = await apiService.api.post('/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Activer/désactiver le mode maintenance
   */
  async toggleMaintenance(enabled: boolean, message?: string) {
    const response = await apiService.api.post('/settings/maintenance', {
      enabled,
      message
    })
    return response.data
  }

  /**
   * Vérifier les mises à jour
   */
  async checkUpdates() {
    const response = await apiService.api.get('/settings/check-updates')
    return response.data
  }

  /**
   * Récupérer les logs système
   */
  async getSystemLogs(params?: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    dateFrom?: string
    dateTo?: string
    limit?: number
  }) {
    const response = await apiService.api.get('/settings/logs', { params })
    return response.data
  }

  /**
   * Vider les logs
   */
  async clearLogs() {
    const response = await apiService.api.delete('/settings/logs')
    return response.data
  }

  /**
   * Récupérer les statistiques d'utilisation
   */
  async getUsageStats() {
    const response = await apiService.api.get('/settings/usage-stats')
    return response.data
  }

  /**
   * Réinitialiser les paramètres par défaut
   */
  async resetToDefaults(section: 'company' | 'system' | 'all') {
    const response = await apiService.api.post('/settings/reset', { section })
    return response.data
  }
}

export const settingsService = new SettingsService()
export default settingsService
