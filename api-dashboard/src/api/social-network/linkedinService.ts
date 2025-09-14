import { SocialNetworkProvider, PublishContent, PublishResult, AccountInfo } from './socialNetworkService';

interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  organizationId?: string;
}

export class LinkedInService implements SocialNetworkProvider {
  name = 'linkedin';
  private config: LinkedInConfig;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(config: LinkedInConfig) {
    this.config = config;
  }

  async publishPost(content: PublishContent): Promise<PublishResult> {
    try {
      // Pour LinkedIn, on publie sur la page d'organisation ou le profil personnel
      const targetUrn = this.config.organizationId 
        ? `urn:li:organization:${this.config.organizationId}`
        : 'urn:li:person:' + await this.getPersonUrn();

      // Construire le texte avec hashtags
      let text = content.text;
      if (content.hashtags && content.hashtags.length > 0) {
        const hashtagsText = content.hashtags.map(tag => 
          tag.startsWith('#') ? tag : `#${tag}`
        ).join(' ');
        text += `\n\n${hashtagsText}`;
      }

      // Créer le contenu de la publication
      const shareData = {
        author: targetUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: content.imageUrl ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Ajouter l'image si fournie
      if (content.imageUrl) {
        const mediaUrn = await this.uploadImage(content.imageUrl);
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          description: {
            text: text
          },
          media: mediaUrn,
          title: {
            text: 'Image partagée'
          }
        }];
      }

      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(shareData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`LinkedIn API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const postId = data.id;
      
      return {
        success: true,
        postId: postId,
        url: `https://linkedin.com/feed/update/${postId}`,
        platform: this.name
      };

    } catch (error) {
      console.error('Erreur publication LinkedIn:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform: this.name
      };
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        profilePicture: data.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        isConnected: true
      };

    } catch (error) {
      console.error('Erreur récupération info LinkedIn:', error);
      return {
        id: '',
        name: 'LinkedIn',
        isConnected: false
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/people/~`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });
      return response.ok;

    } catch (error) {
      console.error('Erreur test connexion LinkedIn:', error);
      return false;
    }
  }

  /**
   * Récupère l'URN de la personne connectée
   */
  private async getPersonUrn(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/people/~`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.id;

    } catch (error) {
      console.error('Erreur récupération URN LinkedIn:', error);
      throw error;
    }
  }

  /**
   * Upload une image sur LinkedIn
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      // Étape 1: Initialiser l'upload
      const initializeResponse = await fetch(`${this.baseUrl}/assets?action=registerUpload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: this.config.organizationId 
              ? `urn:li:organization:${this.config.organizationId}`
              : `urn:li:person:${await this.getPersonUrn()}`,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        })
      });

      if (!initializeResponse.ok) {
        throw new Error(`LinkedIn upload init error: ${initializeResponse.status}`);
      }

      const initData = await initializeResponse.json();
      const uploadUrl = initData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetUrn = initData.value.asset;

      // Étape 2: Télécharger l'image depuis l'URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Impossible de télécharger l\'image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Étape 3: Upload vers LinkedIn
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: imageBuffer,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`LinkedIn upload error: ${uploadResponse.status}`);
      }

      return assetUrn;

    } catch (error) {
      console.error('Erreur upload image LinkedIn:', error);
      throw error;
    }
  }

  /**
   * Récupère les organisations de l'utilisateur
   */
  async getOrganizations(): Promise<Array<{ id: string; name: string }>> {
    try {
      const personUrn = await this.getPersonUrn();
      const response = await fetch(`${this.baseUrl}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organizationalTarget~(id,name)))`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.elements?.map((element: any) => ({
        id: element.organizationalTarget.id,
        name: element.organizationalTarget.name
      })) || [];

    } catch (error) {
      console.error('Erreur récupération organisations LinkedIn:', error);
      return [];
    }
  }
}

export default LinkedInService;
