import { apiService, type ApiResponse } from './api'

export type SupportedPlatform = 'meta' | 'linkedin' | 'twitter' | 'site web' | 'google'

export interface ConfigureCredentialsPayload {
  // Contenu libre selon la plateforme, stocké chiffré côté backend
  // Exemples: { appId, appSecret, accessToken, pageId } pour Meta/FB
  //           { clientId, clientSecret, accessToken, organizationId } pour LinkedIn
  //           { apiKey, apiSecret, accessToken, accessTokenSecret } pour Twitter
  //           { smtp, driveServiceAccountJson } pour Google (mail/drive)
  [key: string]: unknown
}

export interface ConfiguredPlatform {
  platform: SupportedPlatform
  isConfigured: boolean
  hasValidCredentials: boolean
}

class CredentialsService {
  async configure(platform: SupportedPlatform, credentials: ConfigureCredentialsPayload): Promise<ApiResponse> {
    return await apiService.post(`/company/social-networks/${platform}/configure`, { credentials })
  }

  async listConfigured(): Promise<ApiResponse<{ configuredPlatforms: ConfiguredPlatform[]; count: number }>> {
    return await apiService.get('/company/social-networks/credentials')
  }

  async deactivate(platform: Exclude<SupportedPlatform, 'meta' | 'site web' | 'google'>): Promise<ApiResponse> {
    // Backend accepte: facebook/linkedin/twitter selon route actuelle; ici on s'aligne sur credentials.ts routes: ':platform/deactivate'
    // On mappe éventuellement 'meta' -> 'facebook' si besoin à l'avenir.
    return await apiService.delete(`/company/social-networks/${platform}/deactivate`)
  }

  async test(platform: Exclude<SupportedPlatform, 'site web' | 'google'>): Promise<ApiResponse<{ platform: string; ok: boolean }>> {
    return await apiService.post(`/company/social-networks/${platform}/test`, {})
  }
}

export const credentialsService = new CredentialsService()
export default credentialsService


