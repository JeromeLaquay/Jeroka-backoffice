import { SocialNetworkProvider, PublishContent, PublishResult, AccountInfo } from './socialNetworkService';
import crypto from 'crypto';

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export class TwitterService implements SocialNetworkProvider {
  name = 'twitter';
  private config: TwitterConfig;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(config: TwitterConfig) {
    this.config = config;
  }

  async publishPost(content: PublishContent): Promise<PublishResult> {
    try {
      // Construire le texte avec hashtags
      let text = content.text;
      if (content.hashtags && content.hashtags.length > 0) {
        const hashtagsText = content.hashtags.map(tag => 
          tag.startsWith('#') ? tag : `#${tag}`
        ).join(' ');
        text += `\n\n${hashtagsText}`;
      }

      // Ajouter le lien si fourni
      if (content.linkUrl) {
        text += `\n\n${content.linkUrl}`;
      }

      // Vérifier la limite de caractères (280 pour Twitter)
      if (text.length > 280) {
        text = text.substring(0, 277) + '...';
      }

      const tweetData = {
        text: text
      };

      // Si une image est fournie, on doit d'abord l'uploader
      if (content.imageUrl) {
        const mediaId = await this.uploadMedia(content.imageUrl);
        tweetData.media = {
          media_ids: [mediaId]
        };
      }

      const response = await this.makeAuthenticatedRequest('/tweets', 'POST', tweetData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Twitter API Error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        postId: data.data.id,
        url: `https://twitter.com/user/status/${data.data.id}`,
        platform: this.name
      };

    } catch (error) {
      console.error('Erreur publication Twitter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform: this.name
      };
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const response = await this.makeAuthenticatedRequest('/users/me?user.fields=public_metrics,profile_image_url', 'GET');

      if (!response.ok) {
        throw new Error(`Twitter API Error: ${response.status}`);
      }

      const data = await response.json();
      const user = data.data;
      
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        followers: user.public_metrics?.followers_count,
        profilePicture: user.profile_image_url,
        isConnected: true
      };

    } catch (error) {
      console.error('Erreur récupération info Twitter:', error);
      return {
        id: '',
        name: 'Twitter',
        isConnected: false
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/users/me', 'GET');
      return response.ok;

    } catch (error) {
      console.error('Erreur test connexion Twitter:', error);
      return false;
    }
  }

  /**
   * Upload un média sur Twitter
   */
  private async uploadMedia(mediaUrl: string): Promise<string> {
    try {
      // Télécharger l'image depuis l'URL
      const imageResponse = await fetch(mediaUrl);
      if (!imageResponse.ok) {
        throw new Error('Impossible de télécharger l\'image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      // Upload vers Twitter
      const response = await this.makeAuthenticatedRequest('/media/upload', 'POST', {
        media_data: base64Image
      }, 'https://upload.twitter.com/1.1');

      if (!response.ok) {
        throw new Error(`Twitter media upload error: ${response.status}`);
      }

      const data = await response.json();
      return data.media_id_string;

    } catch (error) {
      console.error('Erreur upload média Twitter:', error);
      throw error;
    }
  }

  /**
   * Effectue une requête authentifiée OAuth 1.0a vers l'API Twitter
   */
  private async makeAuthenticatedRequest(
    endpoint: string, 
    method: string, 
    body?: any, 
    baseUrl: string = this.baseUrl
  ): Promise<Response> {
    const url = `${baseUrl}${endpoint}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('hex');

    // Paramètres OAuth
    const oauthParams = {
      oauth_consumer_key: this.config.apiKey,
      oauth_token: this.config.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    // Créer la signature
    const signatureBaseString = this.createSignatureBaseString(method, url, oauthParams, body);
    const signingKey = `${encodeURIComponent(this.config.apiSecret)}&${encodeURIComponent(this.config.accessTokenSecret)}`;
    const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');

    // Headers d'authentification
    const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(oauthParams.oauth_consumer_key)}", oauth_nonce="${encodeURIComponent(oauthParams.oauth_nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="${encodeURIComponent(oauthParams.oauth_signature_method)}", oauth_timestamp="${encodeURIComponent(oauthParams.oauth_timestamp)}", oauth_token="${encodeURIComponent(oauthParams.oauth_token)}", oauth_version="${encodeURIComponent(oauthParams.oauth_version)}"`;

    const headers: any = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    const requestOptions: any = {
      method,
      headers
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    return fetch(url, requestOptions);
  }

  /**
   * Crée la chaîne de base pour la signature OAuth
   */
  private createSignatureBaseString(method: string, url: string, oauthParams: any, body?: any): string {
    // Trier les paramètres
    const allParams = { ...oauthParams };
    
    // Ajouter les paramètres du body si c'est une requête POST avec des paramètres de formulaire
    if (body && typeof body === 'object' && !body.media_data) {
      Object.assign(allParams, body);
    }

    const sortedParams = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    return `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  }

  /**
   * Récupère les tweets récents de l'utilisateur
   */
  async getRecentTweets(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`/users/me/tweets?max_results=${limit}&tweet.fields=created_at,public_metrics`, 'GET');

      if (!response.ok) {
        throw new Error(`Twitter API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];

    } catch (error) {
      console.error('Erreur récupération tweets Twitter:', error);
      return [];
    }
  }

  /**
   * Supprime un tweet
   */
  async deleteTweet(tweetId: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`/tweets/${tweetId}`, 'DELETE');

      return response.ok;

    } catch (error) {
      console.error('Erreur suppression tweet Twitter:', error);
      return false;
    }
  }
}

export default TwitterService;
