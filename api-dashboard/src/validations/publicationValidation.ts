import Joi from 'joi'

export class PublicationValidation {
  static validateCreate(data: any) {
    const schema = Joi.object({
      title: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Le titre est requis',
        'string.min': 'Le titre doit contenir au moins 1 caractère',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères'
      }),
      content: Joi.string().min(1).max(5000).required().messages({
        'string.empty': 'Le contenu est requis',
        'string.min': 'Le contenu doit contenir au moins 1 caractère',
        'string.max': 'Le contenu ne peut pas dépasser 5000 caractères'
      }),
      excerpt: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'L\'extrait ne peut pas dépasser 500 caractères'
      }),
      featured_image: Joi.string().uri().allow('').optional().messages({
        'string.uri': 'L\'URL de l\'image principale doit être valide'
      }),
      images: Joi.array().items(Joi.string().uri()).optional().messages({
        'string.uri': 'Les URLs d\'images doivent être valides'
      }),
      hashtags: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque hashtag ne peut pas dépasser 50 caractères'
      }),
      tags: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque tag ne peut pas dépasser 50 caractères'
      }),
      platforms: Joi.array().items(
        Joi.string().valid('facebook', 'instagram', 'linkedin', 'website')
      ).min(1).required().messages({
        'array.min': 'Au moins une plateforme doit être sélectionnée',
        'any.only': 'Plateforme non supportée'
      }),
      type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').required().messages({
        'any.only': 'Type de publication invalide'
      }),
      status: Joi.string().valid('draft', 'scheduled', 'published').required().messages({
        'any.only': 'Statut invalide'
      }),
      category: Joi.string().max(100).allow('').optional().messages({
        'string.max': 'La catégorie ne peut pas dépasser 100 caractères'
      }),
      seo_title: Joi.string().max(255).allow('').optional().messages({
        'string.max': 'Le titre SEO ne peut pas dépasser 255 caractères'
      }),
      seo_description: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La description SEO ne peut pas dépasser 500 caractères'
      }),
      seo_keywords: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque mot-clé SEO ne peut pas dépasser 50 caractères'
      }),
      scheduled_at: Joi.date().iso().allow('').optional().messages({
        'date.format': 'Format de date invalide (ISO 8601 requis)'
      }),
      view_count: Joi.number().integer().min(0).optional(),
      like_count: Joi.number().integer().min(0).optional(),
      share_count: Joi.number().integer().min(0).optional()
    })

    return schema.validate(data)
  }

  static validateUpdate(data: any) {
    const schema = Joi.object({
      title: Joi.string().min(1).max(200).optional().messages({
        'string.min': 'Le titre doit contenir au moins 1 caractère',
        'string.max': 'Le titre ne peut pas dépasser 200 caractères'
      }),
      content: Joi.string().min(1).max(5000).optional().messages({
        'string.min': 'Le contenu doit contenir au moins 1 caractère',
        'string.max': 'Le contenu ne peut pas dépasser 5000 caractères'
      }),
      excerpt: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'L\'extrait ne peut pas dépasser 500 caractères'
      }),
      featured_image: Joi.string().uri().allow('').optional().messages({
        'string.uri': 'L\'URL de l\'image principale doit être valide'
      }),
      images: Joi.array().items(Joi.string().uri()).optional().messages({
        'string.uri': 'Les URLs d\'images doivent être valides'
      }),
      hashtags: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque hashtag ne peut pas dépasser 50 caractères'
      }),
      tags: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque tag ne peut pas dépasser 50 caractères'
      }),
      platforms: Joi.array().items(
        Joi.string().valid('facebook', 'instagram', 'linkedin', 'website')
      ).min(1).optional().messages({
        'array.min': 'Au moins une plateforme doit être sélectionnée',
        'any.only': 'Plateforme non supportée'
      }),
      type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').optional().messages({
        'any.only': 'Type de publication invalide'
      }),
      status: Joi.string().valid('draft', 'scheduled', 'published').optional().messages({
        'any.only': 'Statut invalide'
      }),
      category: Joi.string().max(100).allow('').optional().messages({
        'string.max': 'La catégorie ne peut pas dépasser 100 caractères'
      }),
      seo_title: Joi.string().max(255).allow('').optional().messages({
        'string.max': 'Le titre SEO ne peut pas dépasser 255 caractères'
      }),
      seo_description: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La description SEO ne peut pas dépasser 500 caractères'
      }),
      seo_keywords: Joi.array().items(Joi.string().max(50)).optional().messages({
        'string.max': 'Chaque mot-clé SEO ne peut pas dépasser 50 caractères'
      }),
      scheduled_at: Joi.date().iso().allow('').optional().messages({
        'date.format': 'Format de date invalide (ISO 8601 requis)'
      }),
      view_count: Joi.number().integer().min(0).optional(),
      like_count: Joi.number().integer().min(0).optional(),
      share_count: Joi.number().integer().min(0).optional()
    })

    return schema.validate(data)
  }

  static validateFilters(filters: any) {
    const schema = Joi.object({
      search: Joi.string().max(100).allow('').optional().messages({
        'string.max': 'La recherche ne peut pas dépasser 100 caractères'
      }),
      status: Joi.string().valid('draft', 'scheduled', 'published').allow('').optional().messages({
        'any.only': 'Statut invalide'
      }),
      category: Joi.string().max(100).allow('').optional().messages({
        'string.max': 'La catégorie ne peut pas dépasser 100 caractères'
      }),
      platform: Joi.string().valid('facebook', 'instagram', 'linkedin', 'website').allow('').optional().messages({
        'any.only': 'Plateforme invalide'
      }),
      type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').allow('').optional().messages({
        'any.only': 'Type de publication invalide'
      }),
      limit: Joi.number().integer().min(1).max(100).optional().messages({
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100'
      }),
      offset: Joi.number().integer().min(0).optional().messages({
        'number.min': 'L\'offset doit être au moins 0'
      }),
      sortBy: Joi.string().valid('created_at', 'updated_at', 'published_at', 'scheduled_at', 'title', 'status').optional().messages({
        'any.only': 'Champ de tri invalide'
      }),
      sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
        'any.only': 'Ordre de tri invalide'
      })
    })

    return schema.validate(filters)
  }

  static validateGenerateContent(data: any) {
    const schema = Joi.object({
      topic: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Le sujet est requis',
        'string.min': 'Le sujet doit contenir au moins 1 caractère',
        'string.max': 'Le sujet ne peut pas dépasser 200 caractères'
      }),
      contentType: Joi.string().valid('promotional', 'educational', 'engaging', 'announcement', 'inspirational', 'behind-scenes').required().messages({
        'any.only': 'Type de contenu invalide'
      }),
      targetAudience: Joi.string().valid('entrepreneurs', 'sme', 'large-companies', 'professionals', 'general-public', 'students').required().messages({
        'any.only': 'Public cible invalide'
      }),
      tone: Joi.string().valid('professional', 'friendly', 'casual', 'expert', 'inspiring', 'humorous').required().messages({
        'any.only': 'Ton invalide'
      }),
      keywords: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'Les mots-clés ne peuvent pas dépasser 500 caractères'
      }),
      callToAction: Joi.string().valid('visit-website', 'contact-us', 'learn-more', 'buy-now', 'book-demo', 'download', 'subscribe', 'share').allow('').optional().messages({
        'any.only': 'Call-to-action invalide'
      }),
      length: Joi.string().valid('short', 'medium', 'long').optional().messages({
        'any.only': 'Longueur invalide'
      }),
      generateImage: Joi.boolean().optional()
    })

    return schema.validate(data)
  }
}

export default PublicationValidation