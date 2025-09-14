// api-dashboard/src/services/companySocialNetworkService.ts
import { SocialCredentialsRepository } from '../repositories/socialCredentialsRepository';
import { SocialNetworkService, SocialNetworkConfig } from '../api/social-network/socialNetworkService';

export class CompanySocialNetworkService {
  /**
   * Configure les identifiants pour une entreprise
   */
  static async configureCredentials(
    companyId: string, 
    platform: string, 
    credentials: any
  ): Promise<void> {
    // Valider les identifiants selon la plateforme
    this.validateCredentials(platform, credentials);
    
    // Vérifier si des identifiants existent déjà
    const existing = await SocialCredentialsRepository.getByCompanyAndPlatform(companyId, platform);
    
    if (existing) {
      await SocialCredentialsRepository.update(companyId, platform, credentials);
    } else {
      await SocialCredentialsRepository.create(companyId, platform, credentials);
    }
  }

  /**
   * Récupère les identifiants d'une entreprise pour une plateforme
   */
  static async getCredentials(companyId: string, platform: string): Promise<any | null> {
    const credentials = await SocialCredentialsRepository.getByCompanyAndPlatform(companyId, platform);
    return credentials?.credentials || null;
  }

  /**
   * Récupère tous les identifiants d'une entreprise
   */
  static async getAllCredentials(companyId: string): Promise<Record<string, any>> {
    const credentials = await SocialCredentialsRepository.getByCompany(companyId);
    const result: Record<string, any> = {};
    
    credentials.forEach(cred => {
      result[cred.platform] = cred.credentials;
    });
    
    return result;
  }

  /**
   * Crée une instance de SocialNetworkService pour une entreprise
   */
  static async createSocialNetworkService(companyId: string): Promise<SocialNetworkService> {
    const credentials = await this.getAllCredentials(companyId);
    
    const config: SocialNetworkConfig = {
      facebook: credentials.facebook ? {
        appId: credentials.facebook.appId,
        appSecret: credentials.facebook.appSecret,
        accessToken: credentials.facebook.accessToken,
        pageId: credentials.facebook.pageId
      } : undefined,
      
      linkedin: credentials.linkedin ? {
        clientId: credentials.linkedin.clientId,
        clientSecret: credentials.linkedin.clientSecret,
        accessToken: credentials.linkedin.accessToken,
        organizationId: credentials.linkedin.organizationId
      } : undefined,
      
      twitter: credentials.twitter ? {
        apiKey: credentials.twitter.apiKey,
        apiSecret: credentials.twitter.apiSecret,
        accessToken: credentials.twitter.accessToken,
        accessTokenSecret: credentials.twitter.accessTokenSecret
      } : undefined
    };
    
    return new SocialNetworkService(config);
  }

  /**
   * Valide les identifiants selon la plateforme
   */
  private static validateCredentials(platform: string, credentials: any): void {
    switch (platform) {
      case 'facebook':
        if (!credentials.appId || !credentials.accessToken) {
          throw new Error('Facebook: appId et accessToken requis');
        }
        break;
        
      case 'linkedin':
        if (!credentials.clientId || !credentials.accessToken) {
          throw new Error('LinkedIn: clientId et accessToken requis');
        }
        break;
        
      case 'twitter':
        if (!credentials.apiKey || !credentials.accessToken || !credentials.accessTokenSecret) {
          throw new Error('Twitter: apiKey, accessToken et accessTokenSecret requis');
        }
        break;
        
      default:
        throw new Error(`Plateforme non supportée: ${platform}`);
    }
  }

  /**
   * Désactive les identifiants d'une entreprise
   */
  static async deactivateCredentials(companyId: string, platform: string): Promise<void> {
    await SocialCredentialsRepository.deactivate(companyId, platform);
  }
}
