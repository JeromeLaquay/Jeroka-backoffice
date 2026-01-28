import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';

export class GmailMessage {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  sizeEstimate?: number;
  payload?: {
    partId?: string;
    mimeType?: string;
    filename?: string;
    headers?: Array<{
      name?: string;
      value?: string;
    }>;
    body: {
      attachmentId?: string;
      size?: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
  raw?: string;
};

export class GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name?: string;
    value?: string;
  }>;
  body?: {
    size?: number;
    data?: string;
    attachmentId?: string;
  };
}

export class GmailMessageSimple {
  id?: string;
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  date?: string;
  snippet?: string;
  internalDate?: string;
  sizeEstimate?: number;
  attachments?: Array<{
    filename?: string;
    mimeType?: string;
    size?: number;
    id?: string;
    body?: {
      size?: number;
      data?: string;
    };
  }>;
  body?: string;
  htmlBody?: string;
  textBody?: string;
}


export class GoogleMailService {
  static createOAuthClient(credentials: any): OAuth2Client {
    // Conversion en string et validation
    const clientId = String(credentials.oauthClientId || credentials.clientId || '');
    const clientSecret = String(credentials.oauthClientSecret || credentials.clientSecret || '');
    const refreshToken = String(credentials.refreshToken || '');
    const accessToken = String(credentials.accessToken || '');
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
    
    // Debug logging avec validation de type
    logger.info('OAuth Client Configuration:', {
      clientId: clientId && clientId !== 'undefined' ? `${clientId.substring(0, 20)}...` : 'MISSING',
      clientSecret: clientSecret && clientSecret !== 'undefined' ? `${clientSecret.substring(0, 10)}...` : 'MISSING',
      refreshToken: refreshToken && refreshToken !== 'undefined' ? `${refreshToken.substring(0, 20)}...` : 'MISSING',
      accessToken: accessToken && accessToken !== 'undefined' ? `${accessToken.substring(0, 20)}...` : 'MISSING',
      redirectUri,
      credentialsKeys: Object.keys(credentials)
    });
    
    if (!clientId || clientId === 'undefined' || !clientSecret || clientSecret === 'undefined') {
      throw new Error(`Client ID ou Client Secret manquant dans les credentials. ClientId: ${clientId}, ClientSecret: ${clientSecret}`);
    }
    
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    client.setCredentials({ 
      refresh_token: refreshToken !== 'undefined' ? refreshToken : undefined,
      access_token: accessToken !== 'undefined' ? accessToken : undefined
    });
    return client;
  };

  static toGmailQuery(since: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const y = since.getUTCFullYear();
    const m = pad(since.getUTCMonth() + 1);
    const d = pad(since.getUTCDate());
    return `after:${y}/${m}/${d}`;
  };

  static async getRecentEmails(credentials: any, since: Date, maxResults = 25): Promise<GmailMessageSimple[]> {
    const auth = this.createOAuthClient(credentials);
    
    // Vérifier si l'access token est expiré et le rafraîchir si nécessaire
    try {
      await auth.getAccessToken();
    } catch (error) {
      logger.error('Erreur lors du refresh du token:', error);
      throw new Error(`Erreur d'authentification Google: ${error}`);
    }
    
    const gmail = google.gmail({ version: 'v1', auth });
    const q = this.toGmailQuery(since);
    
    try {
      const res = await gmail.users.messages.list({ userId: 'me', q, maxResults });
      const messages = res.data.messages || [];
      const details = await Promise.all(
        messages.map(async (m) => {
          const r = await gmail.users.messages.get({ userId: 'me', id: m.id! });
          const gmailMessage = r.data as GmailMessage;
          return {
            id: gmailMessage.id,
            subject: gmailMessage.snippet,
            from: this.extraireEmailDepuisFrom(gmailMessage.payload?.headers?.find(h => h.name === 'From')?.value),
            to: this.extraireEmailDepuisFrom(gmailMessage.payload?.headers?.find(h => h.name === 'To')?.value),
            cc: this.extraireEmailDepuisFrom(gmailMessage.payload?.headers?.find(h => h.name === 'Cc')?.value),
            bcc: this.extraireEmailDepuisFrom(gmailMessage.payload?.headers?.find(h => h.name === 'Bcc')?.value),
            date: gmailMessage.internalDate,
            snippet: gmailMessage.snippet,
            internalDate: gmailMessage.internalDate,
            sizeEstimate: gmailMessage.sizeEstimate,
            attachments: gmailMessage.payload?.parts?.map(p => ({
              filename: p.filename,
              mimeType: p.mimeType,
              size: p.body?.size,
              id: p.body?.attachmentId,
            })),
            body: gmailMessage.payload?.body?.data,
            htmlBody: gmailMessage.payload?.body?.data,
            textBody: gmailMessage.payload?.body?.data,
          } as GmailMessageSimple;

        })
      );
      return details;
    } catch (error) {
      logger.error('Erreur lors de la récupération des emails Gmail:', error);
      throw new Error(`Erreur lors de la récupération des emails dans la boite Gmail: ${error}`);
    }
  }
  /**
     * Extrait l'adresse email du champ "From" d'un email.
     * @param from Le champ "From" de l'email (ex: "Nom <email@domaine.com>")
     * @returns L'adresse email extraite.
     */
  static extraireEmailDepuisFrom(from: string | undefined): string {
    if (!from) return '';
    const match = from.match(/<(.+?)>/);
    if (match && match[1]) {
      return match[1];
    }
    // Si le format ne contient pas de chevrons, retourne la première partie qui ressemble à un email
    const possibleEmail = from.split(' ').find(part => part.includes('@'));
    return possibleEmail || from;
  };

  static async getAttachmentData(credentials: any, attachmentId: string, messageId: string) {
    const auth = this.createOAuthClient(credentials);
    const gmail = await google.gmail({ version: 'v1', auth });
    const { data } = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId
    });
    return data.data; // Données base64
  }

}export default GoogleMailService;
