import { apiService } from './api'

export type GoogleOAuthStatus = {
  isConnected: boolean
  calendarId: string | null | undefined
  hasServiceAccount: boolean
}

class SettingsSystem {
  async testCalendar(): Promise<{ success: boolean }> {
    const res = await apiService.post('/settings/google/test/calendar')
    console.log('testCalendar', res);
    return res
  }

  async testGmail(): Promise<{ success: boolean }> {
    const res = await apiService.post('/settings/google/test/gmail')
    console.log('testGmail', res);
    return res
  }

  async testDrive(): Promise<{ success: boolean }> {
    const res = await apiService.post('/settings/google/test/drive')
    console.log('testDrive', res);
    return res
  }

  // Méthodes OAuth Google
  async connectGoogle(): Promise<void> {
    console.log('connect google');
    const baseUrl = (import.meta as any)?.env?.VITE_API_URL || (window as any).__API_URL__ || 'http://localhost:3002/api/v1'
    const connectUrl = `${baseUrl}/settings/google/connect`
    window.open(connectUrl, '_blank')
  }

  async getGoogleStatus(): Promise<{ success: boolean; data?: GoogleOAuthStatus }> {
    const res = await apiService.get<GoogleOAuthStatus>('/settings/google/status')
    console.log('getGoogleStatus', res);
    return { success: res.success, data: res.data }
  }
}
export default new SettingsSystem()