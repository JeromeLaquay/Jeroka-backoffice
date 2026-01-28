import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';
import fs from 'fs';
import { Readable } from 'stream';

export class DriveFileSummary {
  id?: string;
  name?: string;
  mimeType?: string | null;
  type?: 'file' | 'folder';
  webViewLink?: string | null;
  children?: DriveFileSummary[];
};

export class GoogleDriveService {

  static createOAuthClient = (credentials: any): OAuth2Client => {
  const clientId = credentials.oauthClientId || credentials.clientId || process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = credentials.oauthClientSecret || credentials.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
  const refreshToken = credentials.refreshToken || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
};

  /**
   * Liste récursivement tous les éléments (dossiers + fichiers) contenus dans un dossier Google Drive.
   *
   * Comportement:
   * - Utilise l'API Drive v3 (files.list) pour récupérer les enfants directs du dossier `folderId`.
   * - Pour chaque sous-dossier trouvé, ré-appelle la fonction de manière récursive afin de descendre toute l'arborescence.
   * - Retourne une liste aplatie (flat) d'objets { id, name, mimeType } représentant dossiers et fichiers trouvés.
   * - Active supportsAllDrives/includeItemsFromAllDrives pour couvrir Mon Drive et Drives partagés.
   *
   * Limitations/performances:
   * - La profondeur de récursion dépend de la structure; sur de très gros volumes, privilégier une pagination/streaming côté appelant.
   * - Le paramètre pageSize limite le nombre d'éléments par appel API (par défaut 50).
   *
   * @param credentials Crédentials OAuth (clientId/secret ou oauthClientId/Secret + refreshToken)
   * @param folderId ID du dossier racine à explorer
   * @param pageSize Nombre max d'éléments par page pour files.list (défaut: 50)
   * @returns Liste aplatie de tous les dossiers et fichiers trouvés (tous niveaux)
   */
  static listAllFilesAndFoldersInFolder = async (credentials: any, folderId: string, pageSize = 100): Promise<DriveFileSummary[]> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    console.log('listAllFilesAndFoldersInFolder drive', drive)
    try {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,webViewLink)',
        pageSize,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
      console.log('listAllFilesAndFoldersInFolder res', res)
      const apiFiles = res.data.files || []
      console.log('apiFiles', apiFiles)
      // Construire une vraie arborescence: chaque dossier contient son tableau children
      const nodes: DriveFileSummary[] = []
      for (const f of apiFiles) {
        const isFolder = f.mimeType === 'application/vnd.google-apps.folder'
        if (isFolder) {
          const children = await this.listAllFilesAndFoldersInFolder(credentials, f.id!, pageSize)
          nodes.push({ id: f.id!, name: f.name!, mimeType: f.mimeType ?? undefined, type: 'folder', webViewLink: f.webViewLink ?? null, children })
        } else {
          nodes.push({ id: f.id!, name: f.name!, mimeType: f.mimeType ?? undefined, type: 'file', webViewLink: f.webViewLink ?? null })
        }
      }
      return nodes
    } catch (error) {
      logger.error('Drive listFilesInFolder error', { error: error instanceof Error ? error.message : error });
      return [];
    }
  };

  static downloadFile = async (credentials: any, fileId: string, destinationPath: string): Promise<boolean> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    try {
      const dest = fs.createWriteStream(destinationPath);
      const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
      await new Promise<void>((resolve, reject) => {
        res.data
          .on('end', () => resolve())
          .on('error', (err: any) => reject(err))
          .pipe(dest);
      });
      return true;
    } catch (error) {
      logger.error('Drive downloadFile error', { error: error instanceof Error ? error.message : error, fileId });
      return false;
    }
  };

  static getFile = async (credentials: any, fileId: string): Promise<DriveFileSummary | null> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    try {
      const res = await drive.files.get({ fileId, fields: 'id,name,mimeType,webViewLink' });
      return res.data as DriveFileSummary;
    }
    catch (error) {
      logger.error('Drive getFile error', { error: error instanceof Error ? error.message : error, fileId });
      return null;
    }
  };

  static createFile = async (credentials: any, parentFolderId: string, name: string, mimeType: string, contentPath?: string, contentBuffer?: Buffer): Promise<DriveFileSummary | null> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    try {
      let media: any = undefined;
      
      if (contentPath) {
        // Créer un fichier à partir d'un chemin local
        media = { mimeType, body: fs.createReadStream(contentPath) as any };
      } else if (contentBuffer) {
        // Créer un fichier à partir d'un Buffer en mémoire (convertir en stream)
        const bufferStream = new Readable();
        bufferStream.push(contentBuffer);
        bufferStream.push(null); // Fin du stream
        media = { mimeType, body: bufferStream };
      }
      
      const fileMetadata: any = { name, parents: parentFolderId ? [parentFolderId] : undefined };
      const res = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id,name,mimeType,webViewLink' });
      const f = res.data;
      return f.id && f.name ? { 
        id: f.id, 
        name: f.name, 
        mimeType: f.mimeType ?? undefined,
        webViewLink: f.webViewLink ?? undefined
      } : null;
    } catch (error) {
      logger.error('Drive createFile error', { error: error instanceof Error ? error.message : error, name });
      return null;
    }
  };

  static deleteFile = async (credentials: any, fileId: string): Promise<boolean> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      logger.error('Drive deleteFile error', { error: error instanceof Error ? error.message : error, fileId });
      return false;
    }
  };

  static getFileStream = async (credentials: any, fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string | undefined; name: string | undefined } | null> => {
    const drive = google.drive({ version: 'v3', auth: this.createOAuthClient(credentials) });
    try {
      // Récupérer les métadonnées (mimeType, name)
      const meta = await drive.files.get({ fileId, fields: 'id,name,mimeType' });
      const mimeType = meta.data.mimeType || undefined;
      const name = meta.data.name || undefined;
      
      // Vérifier si c'est un document Google (Docs, Sheets, Slides)
      const isGoogleDoc = mimeType && (
        mimeType.includes('application/vnd.google-apps') ||
        mimeType === 'application/vnd.google-apps.document' ||
        mimeType === 'application/vnd.google-apps.spreadsheet' ||
        mimeType === 'application/vnd.google-apps.presentation'
      );
      
      let res;
      if (isGoogleDoc) {
        // Pour les documents Google, utiliser export
        const exportMimeType = this.getExportMimeType(mimeType);
        res = await drive.files.export({ fileId, mimeType: exportMimeType }, { responseType: 'stream' });
      } else {
        // Pour les fichiers binaires (PDF, images, etc.), utiliser get
        res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
      }
      
      return { stream: res.data as unknown as NodeJS.ReadableStream, mimeType, name };
    } catch (error) {
      logger.error('Drive getFileStream error', { error: error instanceof Error ? error.message : error, fileId });
      return null;
    }
  };

  /**
   * Détermine le type MIME d'export pour les documents Google
   */
  private static getExportMimeType(googleMimeType: string): string {
    switch (googleMimeType) {
      case 'application/vnd.google-apps.document':
        return 'application/pdf'; // Export Google Docs en PDF
      case 'application/vnd.google-apps.spreadsheet':
        return 'application/pdf'; // Export Google Sheets en PDF
      case 'application/vnd.google-apps.presentation':
        return 'application/pdf'; // Export Google Slides en PDF
      default:
        return 'application/pdf'; // Par défaut, export en PDF
    }
  }
}
export default GoogleDriveService;


