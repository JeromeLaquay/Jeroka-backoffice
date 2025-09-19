import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';
import fs from 'fs';

export type DriveFileSummary = {
  id: string;
  name: string;
  mimeType?: string | null;
  type?: 'file' | 'folder';
  webViewLink?: string | null;
  children?: DriveFileSummary[];
};

const createOAuthClient = (credentials: any): OAuth2Client => {
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
export const listAllFilesAndFoldersInFolder = async (credentials: any, folderId: string, pageSize = 100): Promise<DriveFileSummary[]> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
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
        const children = await listAllFilesAndFoldersInFolder(credentials, f.id!, pageSize)
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

export const downloadFile = async (credentials: any, fileId: string, destinationPath: string): Promise<boolean> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
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

export const createFile = async (credentials: any, name: string, mimeType: string, parentFolderId?: string, contentPath?: string): Promise<DriveFileSummary | null> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
  try {
    const media = contentPath ? { mimeType, body: fs.createReadStream(contentPath) as any } : undefined;
    const fileMetadata: any = { name, parents: parentFolderId ? [parentFolderId] : undefined };
    const res = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id,name,mimeType' });
    const f = res.data;
    return f.id && f.name ? { id: f.id, name: f.name, mimeType: f.mimeType ?? undefined } : null;
  } catch (error) {
    logger.error('Drive createFile error', { error: error instanceof Error ? error.message : error, name });
    return null;
  }
};

export const deleteFile = async (credentials: any, fileId: string): Promise<boolean> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    logger.error('Drive deleteFile error', { error: error instanceof Error ? error.message : error, fileId });
    return false;
  }
};

export const getFileStream = async (credentials: any, fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string | undefined; name: string | undefined } | null> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
  try {
    // Récupérer les métadonnées (mimeType, name)
    const meta = await drive.files.get({ fileId, fields: 'id,name,mimeType' });
    const mimeType = meta.data.mimeType || undefined;
    const name = meta.data.name || undefined;
    // Récupérer le flux du fichier
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    return { stream: res.data as unknown as NodeJS.ReadableStream, mimeType, name };
  } catch (error) {
    logger.error('Drive getFileStream error', { error: error instanceof Error ? error.message : error, fileId });
    return null;
  }
};

export default { listAllFilesAndFoldersInFolder, downloadFile, createFile, deleteFile, getFileStream };


