import { FacebookService } from './facebookService';
import { LinkedInService } from './linkedinService';
import { TwitterService } from './twitterService';

export interface SocialNetworkProvider {
  name: string;
  publishPost(content: PublishContent): Promise<PublishResult>;
  getAccountInfo(): Promise<AccountInfo>;
  testConnection(): Promise<boolean>;
}

export interface PublishContent {
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  hashtags?: string[];
  scheduledAt?: Date;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platform: string;
}

export interface AccountInfo {
  id: string;
  name: string;
  username?: string;
  followers?: number;
  profilePicture?: string;
  isConnected: boolean;
}

export interface SocialNetworkConfig {
  facebook?: {
    appId: string;
    appSecret: string;
    accessToken: string;
    pageId?: string;
  };
  linkedin?: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    organizationId?: string;
  };
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
}

export class SocialNetworkService {
  private providers: Map<string, SocialNetworkProvider> = new Map();
  private config: SocialNetworkConfig;

  constructor(config: SocialNetworkConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialiser Facebook
    if (this.config.facebook) {
      const facebookService = new FacebookService(this.config.facebook);
      this.providers.set('facebook', facebookService);
    }

    // Initialiser LinkedIn
    if (this.config.linkedin) {
      const linkedinService = new LinkedInService(this.config.linkedin);
      this.providers.set('linkedin', linkedinService);
    }

    // Initialiser Twitter
    if (this.config.twitter) {
      const twitterService = new TwitterService(this.config.twitter);
      this.providers.set('twitter', twitterService);
    }
  }

  /**
   * Publie sur une plateforme spécifique
   */
  async publishToPlatform(platform: string, content: PublishContent): Promise<PublishResult> {
    const provider = this.providers.get(platform);
    if (!provider) {
      return {
        success: false,
        error: `Plateforme ${platform} non configurée`,
        platform
      };
    }

    try {
      return await provider.publishPost(content);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform
      };
    }
  }

  /**
   * Publie sur plusieurs plateformes
   */
  async publishToMultiplePlatforms(platforms: string[], content: PublishContent): Promise<PublishResult[]> {
    const promises = platforms.map(platform => this.publishToPlatform(platform, content));
    return Promise.all(promises);
  }

  /**
   * Teste la connexion à une plateforme
   */
  async testPlatformConnection(platform: string): Promise<boolean> {
    const provider = this.providers.get(platform);
    if (!provider) {
      return false;
    }

    try {
      return await provider.testConnection();
    } catch (error) {
      console.error(`Erreur test connexion ${platform}:`, error);
      return false;
    }
  }

  /**
   * Récupère les informations du compte pour une plateforme
   */
  async getAccountInfo(platform: string): Promise<AccountInfo | null> {
    const provider = this.providers.get(platform);
    if (!provider) {
      return null;
    }

    try {
      return await provider.getAccountInfo();
    } catch (error) {
      console.error(`Erreur récupération info compte ${platform}:`, error);
      return null;
    }
  }

  /**
   * Récupère les plateformes disponibles
   */
  getAvailablePlatforms(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Récupère les plateformes connectées
   */
  async getConnectedPlatforms(): Promise<string[]> {
    const platforms = this.getAvailablePlatforms();
    const connectedPlatforms: string[] = [];

    for (const platform of platforms) {
      const isConnected = await this.testPlatformConnection(platform);
      if (isConnected) {
        connectedPlatforms.push(platform);
      }
    }

    return connectedPlatforms;
  }
}

export default SocialNetworkService;
