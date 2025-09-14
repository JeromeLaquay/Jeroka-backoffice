import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { SettingsService } from '../services/settingsService';


const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const settings = await SettingsService.getSettings(userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

export default router;