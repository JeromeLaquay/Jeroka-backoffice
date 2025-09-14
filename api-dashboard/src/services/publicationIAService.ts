import { PublicationService } from './publicationService';
import { CompanyService } from './companyService';
import { iaService } from '@/api/ia/iaService';

export class PublicationIAService {

  static async generateContent(companyId: string, configPublicationIa: any) {
    try {
      const company = await CompanyService.getCompany(companyId);
      if (!company) {
        throw new Error('Company non trouvée');
      }

      const infoCompany = this.generateInfoCompany(company);
      const publicationTextPrompt = this.generatePromptPublicationText(company, configPublicationIa, infoCompany);
      
      // Générer le contenu texte avec timeout
      const aiResponse = await iaService.callOpenAI(publicationTextPrompt)
      
      // Parser la réponse JSON de l'IA
      let parsedContent;
      try {
        parsedContent = JSON.parse(aiResponse || '{}');
      } catch (parseError) {
        // Si l'IA ne retourne pas du JSON valide, créer une structure par défaut
        parsedContent = {
          title: configPublicationIa.topic || 'Error',
          content: aiResponse || '',
          hashtags: '',
          excerpt: (aiResponse || '').substring(0, 150) + '...',
          seo_title: configPublicationIa.topic || 'Error',
          seo_description: (aiResponse || '').substring(0, 160),
          suggestedKeywords: configPublicationIa.keywords || 'Error'
        };
      }

      // Générer l'image si demandé avec timeout
      let imageUrl = null;
      if (configPublicationIa.generateImage) {
        try {
          const publicationImagePrompt = this.generatePromptPublicationImage(company, configPublicationIa, infoCompany);
          imageUrl = await iaService.callOpenAIImage(publicationImagePrompt)
        } catch (imageError) {
          console.warn('Erreur lors de la génération d\'image:', imageError);
          // Continue sans image si la génération échoue
        }
      }

      return  {
          ...parsedContent,
          image: imageUrl,
          metadata: {
            generatedBy: 'AI',
            timestamp: new Date().toISOString(),
            imageGenerated: !!imageUrl,
            companyId: companyId
          }
        }
    } catch (error) {
      console.error('Erreur lors de la génération de contenu IA:', error);
      throw new Error(`Erreur lors de la génération de contenu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private static generateInfoCompany(company: any) {
    return `Jeroka est une entreprise de services numériques et d'automatisation. Elle propose des solutions clés en main pour les PME et entrepreneurs souhaitant digitaliser leurs activités.

Informations sur l'entreprise :
- Nom : ${company.name || 'Jeroka'}
- Secteur : ${company.sector || 'Services numériques'}
- Description : ${company.description || 'Solutions d\'automatisation et de digitalisation pour PME'}
- Valeurs : Innovation, simplicité, efficacité, accompagnement personnalisé
- Services : Automatisation de processus, développement web, conseil digital, formation
- Cible : PME, entrepreneurs, startups, artisans
- Positionnement : Partenaire de confiance pour la transformation digitale
    `;
  }

  private static generatePromptPublicationText(company: any, configPublicationIa: any, infoCompany: string) {
    //génère un prompt pour la génération du contenu texte
    const prompt = `
Tu es un expert en marketing digital et rédaction de contenu pour les réseaux sociaux. 

${infoCompany}

CONFIGURATION DE LA PUBLICATION :
- Sujet : ${configPublicationIa.topic || 'Services numériques'}
- Type de contenu : ${configPublicationIa.contentType || 'informatif'}
- Public cible : ${configPublicationIa.targetAudience || 'PME et entrepreneurs'}
- Ton : ${configPublicationIa.tone || 'professionnel'}
- Plateformes : ${configPublicationIa.platforms?.join(', ') || 'Facebook, LinkedIn, Site web'}
- Mots-clés : ${configPublicationIa.keywords || 'digitalisation, automatisation, PME'}
- Call-to-action : ${configPublicationIa.callToAction || 'contactez-nous'}
- Longueur : ${configPublicationIa.length || 'moyen'}

INSTRUCTIONS :
1. Crée un contenu adapté aux plateformes sélectionnées
2. Utilise le ton demandé de manière cohérente
3. Intègre naturellement les mots-clés
4. Inclus un call-to-action approprié
5. Adapte la longueur selon les plateformes (Facebook: plus long, Instagram: court avec hashtags, LinkedIn: professionnel, Site web: détaillé)

FORMAT DE RÉPONSE ATTENDU (JSON) :
{
  "title": "Titre accrocheur",
  "content": "Contenu principal adapté aux plateformes",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "excerpt": "Résumé court pour le site web",
  "seo_title": "Titre optimisé SEO",
  "seo_description": "Description SEO (150-160 caractères)",
  "suggestedKeywords": "mot-clé1, mot-clé2, mot-clé3"
}

Génère maintenant le contenu selon ces spécifications.
    `;
    return prompt;
  }

  private static generatePromptPublicationImage(company: any, configPublicationIa: any, infoCompany: string) {
    //génère un prompt pour la génération de l'image
    const prompt = `
Tu es un expert en génération d'images pour le marketing digital et les réseaux sociaux.

CONTEXTE :
${infoCompany}

SUJET DE LA PUBLICATION : ${configPublicationIa.topic || 'Services numériques'}
TYPE DE CONTENU : ${configPublicationIa.contentType || 'informatif'}
TON : ${configPublicationIa.tone || 'professionnel'}

INSTRUCTIONS POUR L'IMAGE :
1. Crée une image professionnelle et moderne
2. Adapte le style au ton demandé (professionnel, amical, inspirant, etc.)
3. Utilise des couleurs cohérentes avec l'identité Jeroka (violet, bleu, blanc)
4. L'image doit être adaptée aux réseaux sociaux (format carré ou rectangulaire)
5. Évite le texte sur l'image (sera ajouté séparément)
6. Focus sur l'aspect visuel et l'émotion

STYLE VISUEL SOUHAITÉ :
- Design moderne et épuré
- Couleurs : dégradé violet-bleu, blanc, gris
- Éléments : icônes, formes géométriques, illustrations minimalistes
- Ambiance : professionnelle, innovante, accessible

Génère une description détaillée pour créer une image qui accompagne parfaitement le contenu de la publication.
    `;
    return prompt;
  }

}

export default PublicationIAService;

