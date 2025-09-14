import { SocialNetworkService, SocialNetworkConfig, PublishContent, PublishResult } from '../api/social-network/socialNetworkService';

export class SocialNetworkManager {
  private socialNetworkService: SocialNetworkService;

  constructor() {
    // Configuration des réseaux sociaux depuis les variables d'environnement
    const config: SocialNetworkConfig = {
      facebook: process.env.FACEBOOK_APP_ID ? {
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET || '',
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
        pageId: process.env.FACEBOOK_PAGE_ID
      } : undefined,
      
      linkedin: process.env.LINKEDIN_CLIENT_ID ? {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
        organizationId: process.env.LINKEDIN_ORGANIZATION_ID
      } : undefined,
      
      twitter: process.env.TWITTER_API_KEY ? {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
      } : undefined
    };

    this.socialNetworkService = new SocialNetworkService(config);
  }

  /**
   * Publie une publication sur les réseaux sociaux sélectionnés
   */
  async publishPublication(publication: any, platforms: string[]): Promise<PublishResult[]> {
    try {
      const content: PublishContent = {
        text: publication.content,
        imageUrl: publication.featured_image || publication.images?.[0],
        linkUrl: publication.link_url,
        hashtags: publication.hashtags || [],
        scheduledAt: publication.scheduled_at ? new Date(publication.scheduled_at) : undefined
      };

      return await this.socialNetworkService.publishToMultiplePlatforms(platforms, content);

    } catch (error) {
      console.error('Erreur publication réseaux sociaux:', error);
      throw error;
    }
  }

  /**
   * Teste la connexion à tous les réseaux sociaux
   */
  async testAllConnections(): Promise<Record<string, boolean>> {
    const platforms = this.socialNetworkService.getAvailablePlatforms();
    const results: Record<string, boolean> = {};

    for (const platform of platforms) {
      try {
        results[platform] = await this.socialNetworkService.testPlatformConnection(platform);
      } catch (error) {
        console.error(`Erreur test connexion ${platform}:`, error);
        results[platform] = false;
      }
    }

    return results;
  }

  /**
   * Récupère les informations de tous les comptes connectés
   */
  async getAllAccountInfo(): Promise<Record<string, any>> {
    const platforms = this.socialNetworkService.getAvailablePlatforms();
    const results: Record<string, any> = {};

    for (const platform of platforms) {
      try {
        results[platform] = await this.socialNetworkService.getAccountInfo(platform);
      } catch (error) {
        console.error(`Erreur récupération info ${platform}:`, error);
        results[platform] = { isConnected: false };
      }
    }

    return results;
  }

  /**
   * Récupère les plateformes disponibles
   */
  getAvailablePlatforms(): string[] {
    return this.socialNetworkService.getAvailablePlatforms();
  }

  /**
   * Récupère les plateformes connectées
   */
  async getConnectedPlatforms(): Promise<string[]> {
    return await this.socialNetworkService.getConnectedPlatforms();
  }

  /**
   * Publie sur une plateforme spécifique
   */
  async publishToPlatform(platform: string, content: PublishContent): Promise<PublishResult> {
    return await this.socialNetworkService.publishToPlatform(platform, content);
  }

  /**
   * Teste la connexion à une plateforme spécifique
   */
  async testPlatformConnection(platform: string): Promise<boolean> {
    return await this.socialNetworkService.testPlatformConnection(platform);
  }

  /**
   * Récupère les informations d'un compte spécifique
   */
  async getAccountInfo(platform: string): Promise<any> {
    return await this.socialNetworkService.getAccountInfo(platform);
  }

  /**
   * Génère un rapport de publication
   */
  async generatePublicationReport(publicationId: string, results: PublishResult[]): Promise<any> {
    const report = {
      publicationId,
      timestamp: new Date().toISOString(),
      totalPlatforms: results.length,
      successfulPublications: results.filter(r => r.success).length,
      failedPublications: results.filter(r => !r.success).length,
      platforms: results.map(result => ({
        platform: result.platform,
        success: result.success,
        postId: result.postId,
        url: result.url,
        error: result.error
      })),
      summary: {
        successRate: results.length > 0 ? (results.filter(r => r.success).length / results.length) * 100 : 0,
        totalReach: 0, // À calculer selon les métriques des plateformes
        engagement: 0  // À calculer selon les métriques des plateformes
      }
    };

    return report;
  }

  /**
   * Valide les paramètres de publication
   */
  validatePublicationContent(content: PublishContent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.text || content.text.trim().length === 0) {
      errors.push('Le contenu texte est requis');
    }

    if (content.text && content.text.length > 2000) {
      errors.push('Le contenu texte ne peut pas dépasser 2000 caractères');
    }

    if (content.hashtags && content.hashtags.length > 10) {
      errors.push('Maximum 10 hashtags autorisés');
    }

    if (content.scheduledAt && content.scheduledAt < new Date()) {
      errors.push('La date de programmation ne peut pas être dans le passé');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instance singleton
export const socialNetworkManager = new SocialNetworkManager();
export default socialNetworkManager;
