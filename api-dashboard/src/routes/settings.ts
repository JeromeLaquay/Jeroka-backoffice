import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { SettingsService } from '../services/settingsService';
import { SocialCredentialsRepository, SocialCredentials } from '../repositories/socialCredentialsRepository';
import { saveGoogleSettingsSchema, oauthConnectSchema } from '../validations/googleSettingsValidation';
import { google } from 'googleapis';
import { logger } from '../utils/logger';


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

// Google settings sub-routes
router.get('/google', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = await SettingsService.getGoogleSettings(userId, SocialCredentialsRepository);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/google', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = saveGoogleSettingsSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });
    const data = await SettingsService.saveGoogleSettings(req.user!.id, value, SocialCredentialsRepository);
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const buildOAuthClient = (cred: any) => {
  const client = new google.auth.OAuth2(cred.oauthClientId || '', cred.oauthClientSecret || '', process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob');
  client.setCredentials({ refresh_token: cred.refreshToken || '' });
  return client;
};

router.post('/google/test/calendar', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
    const auth = buildOAuthClient(cred.credentials);
    const cal = google.calendar({ version: 'v3', auth });
    const calendarId = cred.credentials.calendarId || 'primary';
    await cal.events.list({ calendarId, maxResults: 1 });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/google/test/gmail', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
    const auth = buildOAuthClient(cred.credentials);
    const gmail = google.gmail({ version: 'v1', auth });
    await gmail.users.labels.list({ userId: 'me' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/google/test/drive', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) return res.status(400).json({ success: false, message: 'Non configuré' });
    const auth = buildOAuthClient(cred.credentials);
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.list({ pageSize: 1, fields: 'files(id)' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Routes OAuth Google pour connexion utilisateur
router.get('/google/connect', verifyToken, async (req: AuthRequest, res: Response) => {
  console.log('connect google');
  try {
    let defaultCredentials = {
      oauthClientId: process.env.GOOGLE_CLIENT_ID || '',
      oauthClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/v1/settings/google/callback'
    };
    
    // Récupérer les credentials OAuth de l'entreprise (clientId/clientSecret)
    let existingCreds: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    console.log('existingCreds', existingCreds);
    if (!existingCreds) {
      defaultCredentials = {
          oauthClientId: process.env.GOOGLE_CLIENT_ID || '',
          oauthClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/v1/settings/google/callback'
      };
    }
    console.log('clientId', defaultCredentials.oauthClientId);
    console.log('clientSecret', defaultCredentials.oauthClientSecret);
    console.log('redirectUri', defaultCredentials.redirectUri);
    if (!defaultCredentials.oauthClientId || !defaultCredentials.oauthClientSecret) {
      return res.status(400).json({ 
        success: false, 
        message: "OAuth Client ID et Secret doivent être configurés d'abord" 
      });
    }

    // Valider les credentials OAuth
    const { error } = oauthConnectSchema.validate({
      oauthClientId: defaultCredentials.oauthClientId,
      oauthClientSecret: defaultCredentials.oauthClientSecret
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      defaultCredentials.oauthClientId,
      defaultCredentials.oauthClientSecret,
      defaultCredentials.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: req.user!.id // Pour sécuriser le callback
    });
    console.log('authUrl', authUrl);
    logger.info('Génération URL OAuth Google', { userId: req.user!.id, authUrl });
    return res.redirect(authUrl);
  } catch (error: any) {
    logger.error('Erreur génération URL OAuth Google', { error: error.message });
    res.status(500).json({ success: false, message: "Erreur lors de la génération de l'URL de connexion" });
  }
});

router.get('/google/callback', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ success: false, message: 'Code ou state manquant' });
    }

    const companyId = state as string;
    
    // Récupérer les credentials OAuth de l'entreprise
    const existingCreds = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    
    if (!existingCreds || !existingCreds.credentials.oauthClientId || !existingCreds.credentials.oauthClientSecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credentials OAuth non trouvés' 
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      existingCreds.credentials.oauthClientId,
      existingCreds.credentials.oauthClientSecret,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3002/api/v1/settings/google/callback'
    );

    // Échanger le code contre les tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    
    if (!tokens.refresh_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token non reçu. Veuillez révoquer l\'accès et réessayer.' 
      });
    }

    // Mettre à jour les credentials avec le refresh token
    const updatedCredentials = {
      ...existingCreds.credentials,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date
    };

    await SocialCredentialsRepository.upsertGoogle(req.user!.id, 'google', updatedCredentials);

    logger.info('Connexion OAuth Google réussie', { companyId });
    
    // Rediriger vers le frontend avec un paramètre de succès
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/parametres?google=connected`);
  } catch (error: any) {
    logger.error('Erreur callback OAuth Google', { error: error.message });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/parametres?google=error`);
  }
});

router.get('/google/status', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const googleSettings = await SettingsService.getGoogleSettings(userId, SocialCredentialsRepository);
    
    return res.json({ 
      success: true, 
      data: {
        isConnected: googleSettings.hasOAuth,
        calendarId: googleSettings.calendarId,
        hasServiceAccount: googleSettings.hasServiceAccount
      }
    });
  } catch (error: any) {
    logger.error('Erreur récupération statut Google', { error: error.message });
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération du statut' });
  }
});