import Joi from 'joi';

// Schémas de validation pour les entreprises
export const companySchemas = {
  // Validation pour la création d'une entreprise
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    address_line1: Joi.string().max(255).optional(),
    address_line2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    vat_number: Joi.string().max(50).optional(),
    siret: Joi.string().max(20).optional(),
    tax_regime: Joi.string().max(50).optional(),
    subscription_plan: Joi.string().valid('free', 'basic', 'premium', 'enterprise').default('free'),
    is_active: Joi.boolean().default(true)
  }),

  // Validation pour la mise à jour d'une entreprise
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    address_line1: Joi.string().max(255).optional(),
    address_line2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    vat_number: Joi.string().max(50).optional(),
    siret: Joi.string().max(20).optional(),
    tax_regime: Joi.string().max(50).optional(),
    banking_info: Joi.object().optional(),
    invoice_settings: Joi.object().optional(),
    quote_settings: Joi.object().optional(),
    email_settings: Joi.object().optional(),
    theme: Joi.string().max(50).optional(),
    is_active: Joi.boolean().optional(),
    subscription_plan: Joi.string().valid('free', 'basic', 'premium', 'enterprise').optional(),
    subscription_status: Joi.string().valid('active', 'suspended', 'cancelled').optional(),
    subscription_expires_at: Joi.date().optional()
  }),

  // Validation pour les filtres de recherche
  filters: Joi.object({
    search: Joi.string().max(100).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    subscription_plan: Joi.string().valid('free', 'basic', 'premium', 'enterprise').optional(),
    subscription_status: Joi.string().valid('active', 'suspended', 'cancelled').optional(),
    created_from: Joi.date().optional(),
    created_to: Joi.date().optional(),
    sort_by: Joi.string().valid('name', 'created_at', 'subscription_plan').default('created_at'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10)
  }),

  // Validation pour l'ID entreprise
  companyId: Joi.string().uuid().required(),

  // Validation pour les paramètres d'entreprise
  settings: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional()
  }),

  // Validation pour le changement de statut
  toggleStatus: Joi.object({
    is_active: Joi.boolean().required()
  }),

  // Validation pour la mise à jour du plan d'abonnement
  updateSubscription: Joi.object({
    subscription_plan: Joi.string().valid('free', 'basic', 'premium', 'enterprise').required(),
    subscription_status: Joi.string().valid('active', 'suspended', 'cancelled').optional(),
    subscription_expires_at: Joi.date().optional()
  })
};

// Fonctions de validation
export class CompanyValidation {
  /**
   * Valide les données de création d'une entreprise
   */
  static validateCreate(data: any): { error?: string; value?: any } {
    const { error, value } = companySchemas.create.validate(data, {
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
   * Valide les données de mise à jour d'une entreprise
   */
  static validateUpdate(data: any): { error?: string; value?: any } {
    const { error, value } = companySchemas.update.validate(data, {
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
    const { error, value } = companySchemas.filters.validate(filters, {
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
   * Valide un ID entreprise
   */
  static validateCompanyId(companyId: string): { error?: string; value?: string } {
    const { error, value } = companySchemas.companyId.validate(companyId);
    
    if (error) {
      return { error: 'ID entreprise invalide' };
    }

    return { value };
  }

  /**
   * Valide les paramètres d'entreprise
   */
  static validateSettings(settings: any): { error?: string; value?: any } {
    const { error, value } = companySchemas.settings.validate(settings, {
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
   * Valide le changement de statut
   */
  static validateToggleStatus(data: any): { error?: string; value?: any } {
    const { error, value } = companySchemas.toggleStatus.validate(data, {
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
   * Valide la mise à jour de l'abonnement
   */
  static validateUpdateSubscription(data: any): { error?: string; value?: any } {
    const { error, value } = companySchemas.updateSubscription.validate(data, {
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
    if (!value.name || value.name.trim().length < 2) {
      return { error: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' };
    }

    // Validation de l'email unique (sera vérifié en base)
    if (!value.email || !value.email.includes('@')) {
      return { error: 'Email invalide' };
    }

    // Validation du numéro SIRET si fourni (format français)
    if (value.siret && !/^\d{14}$/.test(value.siret.replace(/\s/g, ''))) {
      return { error: 'Le numéro SIRET doit contenir 14 chiffres' };
    }

    // Validation du numéro de TVA si fourni
    if (value.vat_number && value.vat_number.length < 8) {
      return { error: 'Le numéro de TVA doit contenir au moins 8 caractères' };
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
    if (value.name && value.name.trim().length < 2) {
      return { error: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' };
    }

    // Validation de l'email si fourni
    if (value.email && !value.email.includes('@')) {
      return { error: 'Email invalide' };
    }

    // Validation du numéro SIRET si fourni
    if (value.siret && !/^\d{14}$/.test(value.siret.replace(/\s/g, ''))) {
      return { error: 'Le numéro SIRET doit contenir 14 chiffres' };
    }

    // Validation du numéro de TVA si fourni
    if (value.vat_number && value.vat_number.length < 8) {
      return { error: 'Le numéro de TVA doit contenir au moins 8 caractères' };
    }

    // Validation de la cohérence des dates d'abonnement
    if (value.subscription_expires_at && value.subscription_status === 'active') {
      const expiresAt = new Date(value.subscription_expires_at);
      const now = new Date();
      if (expiresAt <= now) {
        return { error: 'La date d\'expiration de l\'abonnement doit être dans le futur pour un statut actif' };
      }
    }

    return { value };
  }
}

