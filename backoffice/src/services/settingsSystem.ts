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

  // Méthodes OAuth Google : appel authentifié pour obtenir l'URL, puis redirection
  async connectGoogle(): Promise<void> {
    try {
      const res = await apiService.get<{ success?: boolean; redirectUrl?: string; message?: string }>(
        '/settings/google/connect'
      )
      const redirectUrl = (res as any)?.redirectUrl ?? (res as any)?.data?.redirectUrl
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }
      const msg = (res as any)?.message || 'Impossible d\'obtenir l\'URL de connexion Google'
      throw new Error(msg)
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message ?? 'Connexion Google échouée'
      const isNetworkError = !err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK')
      const message = isNetworkError
        ? 'Erreur réseau : l\'API ne répond pas. Vérifiez que la gateway est démarrée (port 3000) et l\'URL dans les paramètres.'
        : msg
      throw new Error(message)
    }
  }

  async getGoogleStatus(): Promise<{ success: boolean; data?: GoogleOAuthStatus }> {
    const res = await apiService.get<GoogleOAuthStatus>('/settings/google/status')
    console.log('getGoogleStatus', res);
    return { success: res.success, data: res.data }
  }
}
export default new SettingsSystem()