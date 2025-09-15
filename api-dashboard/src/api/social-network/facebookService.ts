import { SocialNetworkProvider, PublishContent, PublishResult, AccountInfo } from './socialNetworkService';

interface FacebookConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  pageId?: string;
}

export class FacebookService implements SocialNetworkProvider {
  name = 'facebook';
  private config: FacebookConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: FacebookConfig) {
    this.config = config;
  }

  async publishPost(credentials: any, content: PublishContent): Promise<PublishResult> {
    try {
      const pageId = this.config.pageId || 'me';
      const endpoint = `${this.baseUrl}/${pageId}/feed`;

      // Construire le message avec hashtags
      let message = content.text;
      if (content.hashtags && content.hashtags.length > 0) {
        const hashtagsText = content.hashtags.map(tag => 
          tag.startsWith('#') ? tag : `#${tag}`
        ).join(' ');
        message += `\n\n${hashtagsText}`;
      }

      const postData: any = {
        message: message,
        access_token: credentials.accessToken
      };

      // Ajouter l'image si fournie
      if (content.imageUrl) {
        postData.link = content.imageUrl;
      }

      // Ajouter le lien si fourni
      if (content.linkUrl) {
        postData.link = content.linkUrl;
      }

      // Programmer la publication si nécessaire
      if (content.scheduledAt) {
        postData.scheduled_publish_time = Math.floor(content.scheduledAt.getTime() / 1000);
        postData.published = false;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(`Facebook API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json() as any;
      
      return {
        success: true,
        postId: data.id,
        url: `https://facebook.com/${data.id}`,
        platform: this.name
      };

    } catch (error) {
      console.error('Erreur publication Facebook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform: this.name
      };
    }
  }

  async getAccountInfo(credentials: any): Promise<AccountInfo> {
    try {
      const pageId = this.config.pageId || 'me';
      const endpoint = `${this.baseUrl}/${pageId}?fields=id,name,username,followers_count,picture&access_token=${credentials.accessToken}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Facebook API Error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return {
        id: data.id,
        name: data.name,
        username: data.username,
        followers: data.followers_count,
        profilePicture: data.picture?.data?.url,
        isConnected: true
      };

    } catch (error) {
      console.error('Erreur récupération info Facebook:', error);
      return {
        id: '',
        name: 'Facebook',
        isConnected: false
      };
    }
  }

  async testConnection(credentials: any): Promise<boolean> {
    try {
      const pageId = this.config.pageId || 'me';
      const endpoint = `${this.baseUrl}/${pageId}?fields=id&access_token=${credentials.accessToken}`;

      const response = await fetch(endpoint);
      return response.ok;

    } catch (error) {
      console.error('Erreur test connexion Facebook:', error);
      return false;
    }
  }

  /**
   * Récupère les pages Facebook de l'utilisateur
   */
  async getPages(credentials: any): Promise<Array<{ id: string; name: string; access_token: string }>> {
    try {
      const endpoint = `${this.baseUrl}/me/accounts?access_token=${credentials.accessToken}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Facebook API Error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.data || [];

    } catch (error) {
      console.error('Erreur récupération pages Facebook:', error);
      return [];
    }
  }

  /**
   * Publie une photo sur Facebook
   */
  async publishPhoto(credentials: any, imageUrl: string, caption?: string): Promise<PublishResult> {
    try {
      const pageId = this.config.pageId || 'me';
      const endpoint = `${this.baseUrl}/${pageId}/photos`;

      const postData = {
        url: imageUrl,
        caption: caption || '',
        access_token: credentials.accessToken
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(`Facebook API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json() as any;
      
      return {
        success: true,
        postId: data.id,
        url: `https://facebook.com/${data.id}`,
        platform: this.name
      };

    } catch (error) {
      console.error('Erreur publication photo Facebook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform: this.name
      };
    }
  }
}

export default FacebookService;
