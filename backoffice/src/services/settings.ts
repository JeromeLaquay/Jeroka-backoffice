import { apiService } from './api'

export type SystemSettings = {
  companySettings: Record<string, any>
  userSettings: Record<string, any>
  systemSettings: {
    version: string
    environment: string
  }
}

export class SettingsApi {
  async getAll(): Promise<{ success: boolean; data?: SystemSettings }> {
    return apiService.get('/settings')
  }
}

// Compat: certains composants importent `settingsService`
export const settingsService = new SettingsApi()
export default settingsService


