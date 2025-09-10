import { Router, Request, Response } from 'express';
import { verifyToken } from '@/middleware/auth';
import { query, body, param, validationResult } from 'express-validator';

const router = Router();

// Interface pour les annonces
interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: 'feature' | 'update' | 'maintenance' | 'security' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  version?: string;
  targetAudience: string[];
  isPinned: boolean;
  sendNotification: boolean;
  views: number;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  publishedAt?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

// Données simulées
let announcements: Announcement[] = [
  {
    id: '1',
    title: 'Nouvelle fonctionnalité : Génération de contenu IA',
    summary: 'Nous avons ajouté la possibilité de générer automatiquement du contenu pour vos publications avec l\'intelligence artificielle.',
    content: `# Génération de contenu IA 🤖

Nous sommes ravis d'annoncer l'ajout d'une nouvelle fonctionnalité révolutionnaire : **la génération automatique de contenu avec l'IA** !

## Qu'est-ce que c'est ?

Cette fonctionnalité vous permet de créer automatiquement :
- **Titres** accrocheurs et pertinents
- **Contenu** optimisé pour vos plateformes
- **Hashtags** populaires et ciblés
- **Images** générées par DALL-E

## Comment l'utiliser ?

1. Accédez à la section Publications
2. Cliquez sur "Générer avec IA"
3. Configurez vos préférences (sujet, ton, public cible)
4. Laissez l'IA créer du contenu personnalisé
5. Modifiez et publiez !

## Avantages

- ⚡ **Gain de temps** considérable
- 🎯 **Contenu personnalisé** selon votre marque
- 📱 **Optimisation multi-plateformes**
- 🎨 **Images créatives** générées automatiquement

Cette fonctionnalité est déjà disponible dans votre interface !`,
    type: 'feature',
    priority: 'high',
    status: 'published',
    version: 'v1.5.0',
    targetAudience: ['all'],
    isPinned: true,
    sendNotification: true,
    views: 245,
    createdAt: new Date('2024-01-20T10:00:00Z').toISOString(),
    publishedAt: new Date('2024-01-20T14:00:00Z').toISOString(),
    author: {
      id: 'dev1',
      name: 'Équipe Développement',
      email: 'dev@jeroka.fr'
    }
  },
  {
    id: '2',
    title: 'Mise à jour : Amélioration des performances',
    summary: 'Optimisations importantes pour une expérience utilisateur plus fluide et rapide.',
    content: `# Mise à jour des performances ⚡

Nous avons déployé plusieurs optimisations pour améliorer significativement les performances de l'application.

## Améliorations apportées

### Vitesse de chargement
- **-40%** de temps de chargement des pages
- Optimisation des requêtes base de données
- Mise en cache intelligente

### Interface utilisateur
- Animations plus fluides
- Réactivité améliorée
- Meilleure gestion de la mémoire

### Synchronisation emails
- **5x plus rapide** pour traiter les emails
- Analyse IA optimisée
- Gestion améliorée des pièces jointes

## Impact sur votre usage

Vous devriez constater :
- Des pages qui s'affichent plus rapidement
- Une navigation plus fluide
- Moins de temps d'attente lors des synchronisations

Aucune action n'est requise de votre part, toutes les améliorations sont automatiques !`,
    type: 'update',
    priority: 'medium',
    status: 'published',
    version: 'v1.4.8',
    targetAudience: ['all'],
    isPinned: false,
    sendNotification: false,
    views: 123,
    createdAt: new Date('2024-01-18T09:00:00Z').toISOString(),
    publishedAt: new Date('2024-01-18T12:00:00Z').toISOString(),
    author: {
      id: 'dev1',
      name: 'Équipe Développement',
      email: 'dev@jeroka.fr'
    }
  },
  {
    id: '3',
    title: 'Maintenance programmée - 25 janvier',
    summary: 'Maintenance de sécurité programmée le 25 janvier de 2h à 4h du matin.',
    content: `# Maintenance programmée 🔧

Une maintenance de sécurité est programmée pour le **25 janvier 2024**.

## Informations importantes

**📅 Date :** Jeudi 25 janvier 2024  
**⏰ Heure :** 02h00 - 04h00 (heure française)  
**⏱️ Durée estimée :** 2 heures maximum

## Services concernés

Pendant cette maintenance, les services suivants seront **temporairement indisponibles** :
- Interface de gestion (backoffice)
- Synchronisation des emails
- API de génération de contenu IA
- Notifications push

## Services non affectés

Ces services continueront de fonctionner normalement :
- Site web principal
- Consultation des données existantes
- Sauvegardes automatiques

## Que faire ?

- **Aucune action requise** de votre part
- Évitez de programmer des tâches importantes pendant cette période
- Les données seront automatiquement synchronisées après la maintenance

## Améliorations apportées

Cette maintenance permettra :
- Mise à jour de sécurité critique
- Optimisation de l'infrastructure
- Amélioration de la stabilité

Nous nous excusons pour le dérangement et vous remercions de votre compréhension.`,
    type: 'maintenance',
    priority: 'high',
    status: 'scheduled',
    version: 'v1.5.1',
    targetAudience: ['all'],
    isPinned: true,
    sendNotification: true,
    views: 89,
    createdAt: new Date('2024-01-22T16:00:00Z').toISOString(),
    scheduledAt: new Date('2024-01-23T08:00:00Z').toISOString(),
    author: {
      id: 'dev1',
      name: 'Équipe Développement',
      email: 'dev@jeroka.fr'
    }
  }
];

router.use(verifyToken);

/**
 * @route GET /api/v1/announcements
 * @desc Get all announcements with filters
 * @access Private
 */
router.get('/', [
  query('search').optional().isString().trim(),
  query('type').optional().isIn(['feature', 'update', 'maintenance', 'security', 'announcement']),
  query('status').optional().isIn(['draft', 'scheduled', 'published', 'archived']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('authorId').optional().isString().trim(),
  query('targetAudience').optional().isString().trim()
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

    const { search, type, status, priority, authorId, targetAudience } = req.query;
    let filteredAnnouncements = [...announcements];

    // Filtrage
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredAnnouncements = filteredAnnouncements.filter(announcement => 
        announcement.title.toLowerCase().includes(searchTerm) ||
        announcement.summary.toLowerCase().includes(searchTerm) ||
        announcement.content.toLowerCase().includes(searchTerm)
      );
    }

    if (type) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.type === type);
    }

    if (status) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.status === status);
    }

    if (priority) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.priority === priority);
    }

    if (authorId) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.author.id === authorId);
    }

    if (targetAudience) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => 
        announcement.targetAudience.includes(targetAudience as string)
      );
    }

    // Tri : épinglées en premier, puis par date de création
    filteredAnnouncements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({
      success: true,
      data: filteredAnnouncements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_ANNOUNCEMENTS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/announcements
 * @desc Create a new announcement
 * @access Private
 */
router.post('/', [
  body('title').notEmpty().trim().withMessage('Le titre est requis'),
  body('summary').notEmpty().trim().withMessage('Le résumé est requis'),
  body('content').notEmpty().trim().withMessage('Le contenu est requis'),
  body('type').isIn(['feature', 'update', 'maintenance', 'security', 'announcement']),
  body('priority').isIn(['low', 'medium', 'high', 'critical']),
  body('status').isIn(['draft', 'scheduled', 'published', 'archived']),
  body('targetAudience').isArray({ min: 1 }).withMessage('Au moins un public cible est requis')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { 
      title, 
      summary, 
      content, 
      type, 
      priority, 
      status, 
      version, 
      targetAudience, 
      isPinned = false, 
      sendNotification = false,
      scheduledAt 
    } = req.body;

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      summary,
      content,
      type,
      priority,
      status,
      version,
      targetAudience,
      isPinned,
      sendNotification,
      views: 0,
      createdAt: new Date().toISOString(),
      scheduledAt: status === 'scheduled' ? scheduledAt : undefined,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
      author: {
        id: (req as any).user?.id || 'anonymous',
        name: (req as any).user?.name || 'Utilisateur',
        email: (req as any).user?.email || 'user@example.com'
      }
    };

    announcements.unshift(newAnnouncement);

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      data: newAnnouncement
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'annonce',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREATE_ANNOUNCEMENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/announcements/:id
 * @desc Get a specific announcement
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = announcements.find(ann => ann.id === id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'annonce',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_ANNOUNCEMENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/announcements/:id
 * @desc Update an announcement
 * @access Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcementIndex = announcements.findIndex(ann => ann.id === id);

    if (announcementIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    const currentAnnouncement = announcements[announcementIndex];
    const updatedAnnouncement: Announcement = {
      ...currentAnnouncement,
      ...req.body,
      updatedAt: new Date().toISOString(),
      publishedAt: req.body.status === 'published' && !currentAnnouncement.publishedAt ? 
        new Date().toISOString() : currentAnnouncement.publishedAt
    };

    announcements[announcementIndex] = updatedAnnouncement;

    res.json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      data: updatedAnnouncement
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'UPDATE_ANNOUNCEMENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/announcements/:id
 * @desc Delete an announcement
 * @access Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcementIndex = announcements.findIndex(ann => ann.id === id);

    if (announcementIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    announcements.splice(announcementIndex, 1);

    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'DELETE_ANNOUNCEMENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/announcements/:id/publish
 * @desc Publish an announcement immediately
 * @access Private
 */
router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcementIndex = announcements.findIndex(ann => ann.id === id);

    if (announcementIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    const announcement = announcements[announcementIndex];
    announcement.status = 'published';
    announcement.publishedAt = new Date().toISOString();
    announcement.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Annonce publiée avec succès',
      data: announcement
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'PUBLISH_ANNOUNCEMENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/announcements/:id/view
 * @desc Increment view count for an announcement
 * @access Private
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = announcements.find(ann => ann.id === id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    announcement.views = (announcement.views || 0) + 1;

    res.json({
      success: true,
      message: 'Vue comptabilisée',
      data: { views: announcement.views }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la comptabilisation de la vue',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'INCREMENT_VIEW_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/announcements/public
 * @desc Get public announcements for end users
 * @access Public
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const { targetAudience, limit = 10, includeArchived = false } = req.query;
    
    let publicAnnouncements = announcements.filter(announcement => {
      // Seulement les annonces publiées ou archivées (selon le paramètre)
      if (announcement.status === 'published' || (includeArchived && announcement.status === 'archived')) {
        // Filtrer par public cible
        if (targetAudience && !announcement.targetAudience.includes(targetAudience as string)) return false;
        return true;
      }
      
      return false;
    });

    // Tri par épinglage puis date
    publicAnnouncements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });

    // Limiter les résultats
    if (limit) {
      publicAnnouncements = publicAnnouncements.slice(0, Number(limit));
    }

    res.json({
      success: true,
      data: publicAnnouncements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces publiques',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_PUBLIC_ANNOUNCEMENTS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/announcements/stats
 * @desc Get announcement statistics
 * @access Private
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const total = announcements.length;
    const published = announcements.filter(a => a.status === 'published').length;
    const scheduled = announcements.filter(a => a.status === 'scheduled').length;
    const draft = announcements.filter(a => a.status === 'draft').length;
    const archived = announcements.filter(a => a.status === 'archived').length;
    const totalViews = announcements.reduce((sum, a) => sum + (a.views || 0), 0);
    const averageViews = total > 0 ? Math.round(totalViews / total) : 0;

    const byType = announcements.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = announcements.reduce((acc, a) => {
      acc[a.priority] = (acc[a.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activité récente (derniers 7 jours)
    const now = new Date();
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPublished = announcements.filter(a => 
        a.publishedAt && a.publishedAt.startsWith(dateStr)
      ).length;
      
      const dayViews = announcements
        .filter(a => a.publishedAt && a.publishedAt.startsWith(dateStr))
        .reduce((sum, a) => sum + (a.views || 0), 0);
      
      recentActivity.push({
        date: dateStr,
        published: dayPublished,
        views: dayViews
      });
    }

    res.json({
      success: true,
      data: {
        total,
        published,
        scheduled,
        draft,
        archived,
        totalViews,
        averageViews,
        byType,
        byPriority,
        recentActivity
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_STATS_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;
