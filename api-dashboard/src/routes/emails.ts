import { verifyToken } from '../middleware/auth';
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import GoogleDocumentService from '../services/googleDocumentService';
import { HistoryLogs } from '../repositories/historyLogs';
const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    if (!userId) {
      HistoryLogs.create({action: 'route: emails, action: GET/emails', complementary_data: 'Error: userId null', status: 'error', type_error: 'api'});
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    const result = await GoogleDocumentService.getLastEmailsFromUserWithDocuments(userId);
    HistoryLogs.create({action: 'route: emails, action: GET/emails', complementary_data: 'Success: l utilisateur '+req.user?.id+' a récupéré ses emails', status: 'success'});
    return res.json(result);
  } catch (error) {
    HistoryLogs.create({action: 'route: emails, action: GET/emails', complementary_data: 'Error: l utilisateur '+req.user?.id+' a voulu récupérer ses emails avec une erreur: '+error, status: 'error', type_error: 'unknown'});
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des emails',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

router.get('/recents-documents', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await GoogleDocumentService.getRecentsDocumentsInMail(userId);
    return res.json(result);
  }
  catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des documents',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;