import { PublicationRepository, Publication, PublicationFilters } from '../repositories/publicationRepository';
import { PublicationValidation } from '../validations/publicationValidation';

export class PublicationService {
  static async list(companyId: string, filters: PublicationFilters) {
    try {
      const { error, value } = PublicationValidation.validateFilters(filters);
      if (error) {
        throw new Error(`Validation des filtres échouée: ${error.message}`);
      }
      return await PublicationRepository.findAll(companyId, value);
    } catch (error) {
      console.error('Erreur lors de la récupération des publications:', error);
      throw new Error('Erreur lors de la récupération des publications');
    }
  }

  static async getById(companyId: string, id: string): Promise<Publication | null> {
    try {
      if (!id || !companyId) {
        throw new Error('ID et companyId sont requis');
      }
      return await PublicationRepository.findById(companyId, id);
    } catch (error) {
      console.error('Erreur lors de la récupération de la publication:', error);
      throw new Error('Erreur lors de la récupération de la publication');
    }
  }

  static async create(companyId: string, data: any) {
    try {
      const { error, value } = PublicationValidation.validateCreate(data);
      if (error) {
        throw new Error(`Validation des données échouée: ${error.message}`);
      }
      
      // Logique métier : vérifier que les plateformes sont valides
      if (!value.platforms || value.platforms.length === 0) {
        throw new Error('Au moins une plateforme doit être sélectionnée');
      }
      
      // Logique métier : si status est 'scheduled', scheduled_at est requis
      if (value.status === 'scheduled' && !value.scheduled_at) {
        throw new Error('La date de programmation est requise pour une publication programmée');
      }
      
      // Logique métier : si status est 'published', définir published_at
      if (value.status === 'published') {
        value.published_at = new Date().toISOString();
      }
      
      const created = await PublicationRepository.create(companyId, value);
      return created;
    } catch (error) {
      console.error('Erreur lors de la création de la publication:', error);
      throw error;
    }
  }

  static async update(companyId: string, id: string, data: any) {
    try {
      const { error, value } = PublicationValidation.validateUpdate(data);
      if (error) {
        throw new Error(`Validation des données échouée: ${error.message}`);
      }
      
      // Logique métier : vérifier que la publication existe
      const existingPublication = await PublicationRepository.findById(companyId, id);
      if (!existingPublication) {
        throw new Error('Publication non trouvée');
      }
      
      // Logique métier : si on change le status vers 'published', définir published_at
      if (value.status === 'published' && existingPublication.status !== 'published') {
        value.published_at = new Date().toISOString();
      }
      
      // Logique métier : si on change le status vers 'scheduled', vérifier scheduled_at
      if (value.status === 'scheduled' && !value.scheduled_at && !existingPublication.scheduled_at) {
        throw new Error('La date de programmation est requise pour une publication programmée');
      }
      
      return await PublicationRepository.update(companyId, id, value);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la publication:', error);
      throw error;
    }
  }

  static async remove(companyId: string, id: string) {
    try {
      if (!id || !companyId) {
        throw new Error('ID et companyId sont requis');
      }
      
      // Logique métier : vérifier que la publication existe
      const existingPublication = await PublicationRepository.findById(companyId, id);
      if (!existingPublication) {
        throw new Error('Publication non trouvée');
      }
      
      return await PublicationRepository.remove(companyId, id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la publication:', error);
      throw error;
    }
  }

  static async publish(companyId: string, id: string) {
    try {
      if (!id || !companyId) {
        throw new Error('ID et companyId sont requis');
      }
      
      // Logique métier : vérifier que la publication existe
      const existingPublication = await PublicationRepository.findById(companyId, id);
      if (!existingPublication) {
        throw new Error('Publication non trouvée');
      }
      
      // Logique métier : vérifier que la publication n'est pas déjà publiée
      if (existingPublication.status === 'published') {
        throw new Error('Cette publication est déjà publiée');
      }
      
      return await PublicationRepository.publish(companyId, id);
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      throw error;
    }
  }

  static async duplicate(companyId: string, id: string, newTitle?: string) {
    try {
      if (!id || !companyId) {
        throw new Error('ID et companyId sont requis');
      }
      
      // Récupérer la publication originale
      const originalPublication = await PublicationRepository.findById(companyId, id);
      if (!originalPublication) {
        throw new Error('Publication originale non trouvée');
      }
      
      // Créer une copie avec les modifications
      const duplicateData = {
        ...originalPublication,
        title: newTitle || `${originalPublication.title} (Copie)`,
        status: 'draft' as const,
        published_at: undefined,
        scheduled_at: undefined,
        created_at: new Date().toISOString(),
        updated_at: undefined
      };
      
      // Supprimer l'ID pour créer une nouvelle publication
      delete (duplicateData as any).id;
      
      return await PublicationRepository.create(companyId, duplicateData);
    } catch (error) {
      console.error('Erreur lors de la duplication de la publication:', error);
      throw error;
    }
  }

  static async getStats(companyId: string) {
    try {
      // Récupérer toutes les publications pour calculer les stats
      const allPublications = await PublicationRepository.findAll(companyId, {});
      
      const stats = {
        total: allPublications.total,
        published: allPublications.publications.filter(p => p.status === 'published').length,
        scheduled: allPublications.publications.filter(p => p.status === 'scheduled').length,
        draft: allPublications.publications.filter(p => p.status === 'draft').length,
        totalViews: allPublications.publications.reduce((sum, p) => sum + (p.view_count || 0), 0),
        totalLikes: allPublications.publications.reduce((sum, p) => sum + (p.like_count || 0), 0),
        totalShares: allPublications.publications.reduce((sum, p) => sum + (p.share_count || 0), 0),
        byPlatform: {} as Record<string, number>,
        byCategory: {} as Record<string, number>
      };
      
      // Calculer les stats par plateforme et catégorie
      allPublications.publications.forEach(publication => {
        if (publication.platforms) {
          publication.platforms.forEach(platform => {
            stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
          });
        }
        
        if (publication.category) {
          stats.byCategory[publication.category] = (stats.byCategory[publication.category] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw new Error('Erreur lors du calcul des statistiques');
    }
  }
}

export default PublicationService;


