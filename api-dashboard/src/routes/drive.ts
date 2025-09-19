import { Router, Response } from 'express';
import { listAllFilesAndFoldersInFolder, getFileStream } from '../api/google/googleDriveService';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { SocialCredentialsRepository } from '../repositories/socialCredentialsRepository';

const router = Router();

router.get('/drive/list', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
  const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
  console.log('cred', cred)
  if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
  const folderId  = '1UH36qfO64XkTKVBf-RlSXeoEs9dQqBWs'
    const list = await listAllFilesAndFoldersInFolder(cred.credentials, folderId);
    console.log('list', list)
    return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});


//open only if it's a file, not a folder
//router.get('/drive/list/:fileId', verifyToken, async (req: AuthRequest, res: Response) => {
    //try {
    //const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    //if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
    //const fileId = req.params.fileId;
    //const list = await listAllFilesAndFoldersInFolder(cred.credentials, fileId);
    //return res.json({ success: true, data: list });
  //} catch (error) {
    //return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  //}
//});

// Proxy streaming d'un fichier (inline)
router.get('/drive/file/:fileId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
    const fileId = req.params.fileId;
    const file = await getFileStream(cred.credentials, fileId);
    if (!file) return res.status(404).json({ success: false, message: 'Fichier introuvable' });

    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    if (file.name) res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    (file.stream as any).pipe(res);
    return res.json({ success: true, data: file });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

export default router;