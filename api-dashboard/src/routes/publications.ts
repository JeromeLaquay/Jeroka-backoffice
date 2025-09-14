import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { query, body, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// import OpenAI from 'openai';
import { PublicationService } from '../services/publicationService';
import { PublicationIAService } from '../services/publicationIAService';
import { PublicationValidation } from '../validations/publicationValidation';

const router = Router();

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/publications');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `publication-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Format d\'image non supporté'));
    }
  }
});

// Interface pour les publications
interface Publication {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  images?: string[];
  hashtags?: string[];
  tags?: string[];
  platforms: string[];
  type: 'standard' | 'promotion' | 'event' | 'announcement' | 'tutorial';
  status: 'draft' | 'scheduled' | 'published';
  category?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  slug: string;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  publishedAt?: string;
}

router.use(verifyToken);

/**
 * @route GET /api/v1/publications
 * @desc Get all publications with filters
 * @access Private
 */
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = (req.user as any)?.companyId || (req.user as any)?.company_id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const result = await PublicationService.list(companyId, req.query as any);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur GET /publications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des publications',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_PUBLICATIONS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/publications
 * @desc Create a new publication
 * @access Private
 */
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.company_id;
    const { title, content, excerpt, featured_image, images, hashtags, tags, platforms, type, status, category, seo_title, seo_description, seo_keywords, scheduled_at } = req.body;
    const newPublication = {
      title,
      content,
      excerpt,
      featured_image,
      images: images || [],
      hashtags: hashtags || [],
      tags: tags || [],
      platforms: platforms || [],
      type,
      status,
      category,
      seo_title,
      seo_description,
      seo_keywords: seo_keywords || [],
      scheduled_at,
    };
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const created = await PublicationService.create(companyId, newPublication);
    return res.status(201).json({ success: true, message: 'Publication créée avec succès', data: created });
  } catch (error) {
    console.error('Erreur POST /publications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la publication',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREATE_PUBLICATION_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/publications/:id
 * @desc Get a specific publication
 * @access Private
 */
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId || (req.user as any)?.company_id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const publication = await PublicationService.getById(companyId, id);
    if (!publication) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publication non trouvée' 
      });
    }
    return res.json({ success: true, data: publication });
  } catch (error) {
    console.error('Erreur GET /publications/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la publication',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_PUBLICATION_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/publications/:id
 * @desc Update a publication
 * @access Private
 */
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId || (req.user as any)?.company_id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const updated = await PublicationService.update(companyId, id, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publication non trouvée' 
      });
    }
    return res.json({ success: true, message: 'Publication mise à jour avec succès', data: updated });
  } catch (error) {
    console.error('Erreur PUT /publications/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'UPDATE_PUBLICATION_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/publications/:id
 * @desc Delete a publication
 * @access Private
 */
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId || (req.user as any)?.company_id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const ok = await PublicationService.remove(companyId, id);
    if (!ok) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publication non trouvée' 
      });
    }
    return res.json({ success: true, message: 'Publication supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /publications/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'DELETE_PUBLICATION_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/publications/:id/publish
 * @desc Publish a publication immediately
 * @access Private
 */
router.post('/:id/publish', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId || (req.user as any)?.company_id;
    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID manquant'
      });
    }

    const published = await PublicationService.publish(companyId, id);
    if (!published) {
      return res.status(404).json({ 
        success: false, 
        message: 'Publication non trouvée' 
      });
    }
    return res.json({ success: true, message: 'Publication publiée avec succès', data: published });
  } catch (error) {
    console.error('Erreur POST /publications/:id/publish:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'PUBLISH_PUBLICATION_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/uploads/image
 * @desc Upload an image for publications
 * @access Private
 */
router.post('/uploads/image', upload.single('image'), verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier image fourni'
      });
    }

    const imageUrl = `/uploads/publications/${req.file.filename}`;
    
    return res.status(201).json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'UPLOAD_IMAGE_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/publications/generate-content
 * @desc Generate publication content using AI
 * @access Private
 */
router.post('/generate-content', [
  body('topic').notEmpty().trim().withMessage('Le sujet est requis'),
  body('contentType').notEmpty().trim().withMessage('Le type de contenu est requis'),
  body('targetAudience').notEmpty().trim().withMessage('Le public cible est requis'),
  body('tone').notEmpty().trim().withMessage('Le ton est requis'),
  body('platforms').isArray({ min: 1 }).withMessage('Au moins une plateforme est requise'),
  body('length').optional().isIn(['short', 'medium', 'long']).withMessage('Longueur invalide'),
  body('generateImage').optional().isBoolean().withMessage('generateImage doit être un booléen')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: errors.array()
      });
    }

    const configPublicationIa = { 
      topic: req.body.topic, 
      contentType: req.body.contentType, 
      targetAudience: req.body.targetAudience, 
      tone: req.body.tone, 
      platforms: req.body.platforms, 
      keywords: req.body.keywords, 
      callToAction: req.body.callToAction, 
      length: req.body.length,
      generateImage: true
    };

    const companyId=(req as any).user?.companyId;
    const resultIa = await PublicationIAService.generateContent(companyId, configPublicationIa);

    return res.json({
      success: true,
      message: 'Contenu généré avec succès',
      data: resultIa
    });

  } catch (error) {
    console.error('Erreur génération IA:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du contenu',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'AI_GENERATION_ERROR',
        statusCode: 500
      }
    });
  }
});

// Fonction pour récupérer les informations de l'entreprise
async function getCompanyInfo(companyId?: string) {
  try {
    // TODO: Récupérer depuis la base de données
    // const companyQuery = 'SELECT * FROM companies WHERE id = $1';
    // const result = await query(companyQuery, [companyId]);
    
    // Pour l'instant, retourner des données par défaut de Jeroka
    return {
      name: 'Jeroka',
      sector: 'Services numériques et automatisation',
      description: 'Entreprise spécialisée dans l\'automatisation des processus métier et la transformation digitale des PME',
      values: 'Innovation, proximité client, expertise technique',
      target: 'PME et entrepreneurs souhaitant digitaliser leurs activités',
      website: 'https://jeroka.fr',
      mission: 'Démocratiser l\'accès aux technologies d\'automatisation pour les petites et moyennes entreprises',
      differentiators: [
        'Approche personnalisée selon le secteur d\'activité',
        'Solutions clés en main sans complexité technique',
        'Accompagnement complet de A à Z',
        'Tarifs transparents et accessibles'
      ],
      tone: 'Professionnel mais accessible, expert sans être prétentieux',
      communicationStyle: 'Direct, pédagogue, rassurant'
    };
  } catch (error) {
    console.error('Erreur récupération info entreprise:', error);
    // Fallback avec des données génériques
    return {
      name: 'Votre Entreprise',
      sector: 'Services',
      description: 'Une entreprise innovante',
      values: 'Excellence, Innovation, Service client',
      target: 'Professionnels et entreprises'
    };
  }
}

// Fonction pour construire le prompt image pour DALL-E
function buildImagePrompt(config: any) {
  const { topic, contentType, companyInfo, title } = config;
  
  const styleInstructions = {
    'promotional': 'professional marketing visual, clean and modern design, vibrant colors',
    'educational': 'educational infographic style, clear and informative, friendly colors',
    'engaging': 'dynamic and engaging visual, eye-catching design, social media optimized',
    'announcement': 'announcement style, professional yet exciting, corporate colors',
    'inspirational': 'inspiring and motivational visual, uplifting atmosphere, warm colors',
    'behind-scenes': 'authentic behind-the-scenes feel, human-centered, natural lighting'
  };

  const businessContext = companyInfo.sector.includes('digital') || companyInfo.sector.includes('automatisation') 
    ? 'technology, digital transformation, automation, modern business' 
    : 'professional business, innovation, growth';

  return `Create a ${styleInstructions[contentType as keyof typeof styleInstructions] || 'professional business'} image for "${title}". 
Business context: ${businessContext}. 
Topic: ${topic}. 
Style: Modern, professional, suitable for ${companyInfo.name} brand identity in ${companyInfo.sector}. 
High quality, no text overlay, suitable for social media and web publication.
Colors should be professional and aligned with business/technology theme.`;
}

// Fonction pour construire le prompt
function buildContentPrompt(config: any) {
  const { topic, contentType, targetAudience, tone, platforms, keywords, callToAction, length, companyInfo } = config;
  
  const lengthInstructions = {
    short: 'très court (1-2 phrases maximum)',
    medium: 'moyen (1 paragraphe de 3-5 phrases)',
    long: 'long (2-3 paragraphes détaillés)'
  };

  const platformInstructions = platforms.map((platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook (ton familier, peut être plus long, encourage l\'engagement)';
      case 'instagram':
        return 'Instagram (visuellement attrayant, utilise des emojis, hashtags importants)';
      case 'linkedin':
        return 'LinkedIn (professionnel, B2B, valeur ajoutée)';
      case 'website':
        return 'Site web (SEO-friendly, informatif, structure claire)';
      default:
        return platform;
    }
  }).join(', ');

  return `
Crée une publication ${lengthInstructions[length as keyof typeof lengthInstructions]} pour les plateformes suivantes : ${platformInstructions}.

IDENTITÉ ENTREPRISE :
- Nom : ${companyInfo.name}
- Secteur : ${companyInfo.sector}
- Description : ${companyInfo.description}
- Mission : ${companyInfo.mission || 'Non spécifiée'}
- Valeurs : ${companyInfo.values}
- Public cible principal : ${companyInfo.target}
- Style de communication : ${companyInfo.communicationStyle || 'Professionnel'}
- Différenciateurs : ${companyInfo.differentiators ? companyInfo.differentiators.join(', ') : 'Innovation, Service client'}

PARAMÈTRES DE CRÉATION :
- Sujet/Thème : ${topic}
- Type de contenu : ${contentType}
- Public cible spécifique : ${targetAudience}
- Ton souhaité : ${tone}
- Mots-clés à inclure : ${keywords || 'N/A'}
- Call-to-action : ${callToAction || 'N/A'}

INSTRUCTIONS SPÉCIFIQUES :
1. Respecte l'identité de marque et les valeurs de ${companyInfo.name}
2. Adopte le style "${companyInfo.communicationStyle}" avec un ton ${tone}
3. Mets en avant la proposition de valeur unique de l'entreprise
4. Adapte le message pour ${targetAudience} en restant cohérent avec ${companyInfo.target}
5. Intègre naturellement les mots-clés : ${keywords || 'les mots-clés du secteur'}
6. ${callToAction ? `Termine par un call-to-action engageant pour : ${callToAction}` : 'Inclus un appel à l\'action approprié'}
7. Optimise pour : ${platforms.join(', ')}
8. Assure-toi que le contenu reflète l'expertise de ${companyInfo.name} dans ${companyInfo.sector}

CONTRAINTES CRÉATIVES :
- Le contenu doit être authentique et refléter la personnalité de l'entreprise
- Évite le jargon excessif, reste accessible
- Créé de l'engagement sans être commercial
- Apporte de la valeur au lecteur

RÉPONSE ATTENDUE (format JSON strict) :
{
  "title": "Titre accrocheur et pertinent pour ${companyInfo.name}",
  "content": "Contenu principal optimisé pour ${platforms.join('/')}, ton ${tone}",
  "hashtags": "#${companyInfo.name.toLowerCase()} #hashtag2 #hashtag3 #hashtag4",
  "keywords": "mots-clés pertinents, ${companyInfo.sector}, innovation",
  "confidence": 0.9,
  "suggestions": ["Suggestion d'amélioration basée sur l'identité de marque", "Conseil pour optimiser l'engagement"]
}
`;
}

// Fonction pour parser le contenu généré
function parseGeneratedContent(content: string) {
  try {
    // Nettoyer le contenu et extraire le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback si pas de JSON valide
    return {
      title: "Contenu généré par IA",
      content: content.trim(),
      hashtags: "#jeroka #innovation",
      keywords: "contenu, marketing, digital",
      confidence: 0.7,
      suggestions: ["Revoir le format de réponse"]
    };
  } catch (error) {
    console.error('Erreur parsing contenu IA:', error);
    return {
      title: "Publication générée",
      content: content.trim().substring(0, 500),
      hashtags: "#jeroka",
      keywords: "",
      confidence: 0.5,
      suggestions: ["Vérifier le format de réponse"]
    };
  }
}

export default router;
