import Joi from 'joi';

// Schémas de validation pour les devis
export const quoteSchemas = {
  // Validation pour la création d'un devis
  create: Joi.object({
    client_id: Joi.string().uuid().required(),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(1).max(500).required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required(),
        discount_percent: Joi.number().min(0).max(100).optional(),
        vat_number: Joi.number().min(0).max(100).optional()
      })
    ).min(1).required(),
    valid_until: Joi.date().greater('now').required(),
    notes: Joi.string().max(1000).optional(),
    status: Joi.string().valid('draft', 'sent').default('draft')
  }),

  // Validation pour la mise à jour d'un devis
  update: Joi.object({
    client_id: Joi.string().uuid().optional(),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(1).max(500).required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required(),
        discount_percent: Joi.number().min(0).max(100).optional(),
        vat_number: Joi.number().min(0).max(100).optional()
      })
    ).min(1).optional(),
    valid_until: Joi.date().greater('now').optional(),
    notes: Joi.string().max(1000).optional(),
    status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted').optional()
  }),

  // Validation pour les filtres de recherche
  filters: Joi.object({
    search: Joi.string().max(100).optional(),
    status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted').optional(),
    clientId: Joi.string().uuid().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'quote_number', 'valid_until', 'total').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10)
  }),

  // Validation pour l'ID devis
  quoteId: Joi.string().uuid().required(),

  // Validation pour l'ID client
  clientId: Joi.string().uuid().required(),

  // Validation pour le statut
  status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted').required(),

  // Validation pour la prolongation de validité
  extendValidity: Joi.object({
    valid_until: Joi.date().greater('now').required(),
    notify_client: Joi.boolean().default(true)
  })
};

// Fonctions de validation
export class QuoteValidation {
  /**
   * Valide les données de création d'un devis
   */
  static validateCreate(data: any): { error?: string; value?: any } {
    const { error, value } = quoteSchemas.create.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return { error: errorMessages };
    }

    return { value };
  }

  /**
   * Valide les données de mise à jour d'un devis
   */
  static validateUpdate(data: any): { error?: string; value?: any } {
    const { error, value } = quoteSchemas.update.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return { error: errorMessages };
    }

    return { value };
  }

  /**
   * Valide les filtres de recherche
   */
  static validateFilters(filters: any): { error?: string; value?: any } {
    const { error, value } = quoteSchemas.filters.validate(filters, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return { error: errorMessages };
    }

    return { value };
  }

  /**
   * Valide un ID devis
   */
  static validateQuoteId(quoteId: string): { error?: string; value?: string } {
    const { error, value } = quoteSchemas.quoteId.validate(quoteId);
    
    if (error) {
      return { error: 'ID devis invalide' };
    }

    return { value };
  }

  /**
   * Valide un ID client
   */
  static validateClientId(clientId: string): { error?: string; value?: string } {
    const { error, value } = quoteSchemas.clientId.validate(clientId);
    
    if (error) {
      return { error: 'ID client invalide' };
    }

    return { value };
  }

  /**
   * Valide un statut de devis
   */
  static validateStatus(status: string): { error?: string; value?: string } {
    const { error, value } = quoteSchemas.status.validate(status);
    
    if (error) {
      return { error: 'Statut de devis invalide' };
    }

    return { value };
  }

  /**
   * Valide les données de prolongation de validité
   */
  static validateExtendValidity(data: any): { error?: string; value?: any } {
    const { error, value } = quoteSchemas.extendValidity.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return { error: errorMessages };
    }

    return { value };
  }

  /**
   * Valide les données de création avec des règles métier spécifiques
   */
  static validateCreateWithBusinessRules(data: any): { error?: string; value?: any } {
    // Validation de base
    const baseValidation = this.validateCreate(data);
    if (baseValidation.error) {
      return baseValidation;
    }

    const value = baseValidation.value!;

    // Règles métier spécifiques
    if (value.items && value.items.length === 0) {
      return { error: 'Au moins un article est requis pour créer un devis' };
    }

    // Vérifier que la date de validité est dans le futur
    const validUntil = new Date(value.valid_until);
    const now = new Date();
    if (validUntil <= now) {
      return { error: 'La date de validité doit être dans le futur' };
    }

    // Vérifier que la date de validité n'est pas trop éloignée (max 1 an)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (validUntil > oneYearFromNow) {
      return { error: 'La date de validité ne peut pas dépasser 1 an' };
    }

    // Vérifier les totaux des articles
    for (const item of value.items) {
      if (item.quantity <= 0) {
        return { error: 'La quantité doit être positive' };
      }
      if (item.unit_price <= 0) {
        return { error: 'Le prix unitaire doit être positif' };
      }
      if (item.discount_percent && (item.discount_percent < 0 || item.discount_percent > 100)) {
        return { error: 'Le pourcentage de remise doit être entre 0 et 100' };
      }
    }

    return { value };
  }

  /**
   * Valide les données de mise à jour avec des règles métier spécifiques
   */
  static validateUpdateWithBusinessRules(data: any): { error?: string; value?: any } {
    // Validation de base
    const baseValidation = this.validateUpdate(data);
    if (baseValidation.error) {
      return baseValidation;
    }

    const value = baseValidation.value!;

    // Règles métier spécifiques
    if (value.items && value.items.length === 0) {
      return { error: 'Au moins un article est requis' };
    }

    // Vérifier la date de validité si fournie
    if (value.valid_until) {
      const validUntil = new Date(value.valid_until);
      const now = new Date();
      if (validUntil <= now) {
        return { error: 'La date de validité doit être dans le futur' };
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (validUntil > oneYearFromNow) {
        return { error: 'La date de validité ne peut pas dépasser 1 an' };
      }
    }

    // Vérifier les totaux des articles si fournis
    if (value.items) {
      for (const item of value.items) {
        if (item.quantity <= 0) {
          return { error: 'La quantité doit être positive' };
        }
        if (item.unit_price <= 0) {
          return { error: 'Le prix unitaire doit être positif' };
        }
        if (item.discount_percent && (item.discount_percent < 0 || item.discount_percent > 100)) {
          return { error: 'Le pourcentage de remise doit être entre 0 et 100' };
        }
      }
    }

    return { value };
  }
}

