import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';
import fs from 'fs';

export type DriveFileSummary = { id: string; name: string; mimeType?: string };

const createOAuthClient = (credentials: any): OAuth2Client => {
  const clientId = credentials.clientId || '';
  const clientSecret = credentials.clientSecret || '';
  const refreshToken = credentials.refreshToken || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
};

export const listFilesInFolder = async (credentials: any, folderId: string, pageSize = 50): Promise<DriveFileSummary[]> => {
  const drive = google.drive({ version: 'v3', auth: createOAuthClient(credentials) });
  try {
    const res = await drive.files.list({ q: `'${folderId}' in parents and trashed=false`, fields: 'files(id,name,mimeType)', pageSize });
    return (res.data.files || []).map(f => ({ id: f.id!, name: f.name!, mimeType: f.mimeType ?? undefined }));
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

export default { listFilesInFolder, downloadFile, createFile, deleteFile };


