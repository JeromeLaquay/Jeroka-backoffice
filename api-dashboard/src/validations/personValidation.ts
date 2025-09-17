import Joi from 'joi';

// Schémas de validation pour les persons
export const personSchemas = {
  // Validation pour la création d'un person
  create: Joi.object({
    company_id: Joi.string().uuid().required(),
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    company_name: Joi.string().min(2).max(100).optional(),
    address_line1: Joi.string().max(255).optional(),
    address_line2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    status: Joi.string().valid('active', 'inactive', 'prospect', 'lead').default('prospect'),
    type: Joi.string().valid('client', 'supplier').required(),
    source: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // Validation pour la mise à jour d'un person
  update: Joi.object({
    first_name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).optional(),
    company_name: Joi.string().min(2).max(100).optional(),
    address_line1: Joi.string().max(255).optional(),
    address_line2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    status: Joi.string().valid('active', 'inactive', 'prospect', 'lead').optional(),
    type: Joi.string().valid('client', 'supplier').optional(),
    source: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  // Validation pour les filtres de recherche
  filters: Joi.object({
    search: Joi.string().max(100).optional(),
    status: Joi.string().valid('active', 'inactive', 'prospect', 'lead').optional(),
    type: Joi.string().valid('client', 'supplier').optional(),
    source: Joi.string().max(100).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'first_name', 'last_name', 'email', 'status').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10)
  }),

  // Validation pour l'ID person
  personId: Joi.string().uuid().required(),

  // Validation pour l'ID entreprise
  companyId: Joi.string().uuid().required()
};

// Fonctions de validation
export class PersonValidation {
  /**
   * Valide les données de création d'un person
   */
  static validateCreate(data: any): { error?: string; value?: any } {
    const { error, value } = personSchemas.create.validate(data, {
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
   * Valide les données de mise à jour d'un person
   */
  static validateUpdate(data: any): { error?: string; value?: any } {
    const { error, value } = personSchemas.update.validate(data, {
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
    const { error, value } = personSchemas.filters.validate(filters, {
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
   * Valide un ID person
   */
  static validatepersonId(personId: string): { error?: string; value?: string } {
    const { error, value } = personSchemas.personId.validate(personId);
    
    if (error) {
      return { error: 'ID person invalide' };
    }

    return { value };
  }

  /**
   * Valide un ID entreprise
   */
  static validateCompanyId(companyId: string): { error?: string; value?: string } {
    const { error, value } = personSchemas.companyId.validate(companyId);
    
    if (error) {
      return { error: 'ID entreprise invalide' };
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
    if (value.type === 'company' && !value.company_name) {
      return { error: 'Le nom de l\'entreprise est requis pour un person de type "company"' };
    }

    if (value.type === 'individual' && value.company_name) {
      return { error: 'Le nom de l\'entreprise ne peut pas être renseigné pour un person de type "individual"' };
    }

    // Validation de l'email unique (sera vérifié en base)
    if (!value.email || !value.email.includes('@')) {
      return { error: 'Email invalide' };
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
    if (value.type === 'company' && !value.company_name) {
      return { error: 'Le nom de l\'entreprise est requis pour un person de type "company"' };
    }

    if (value.type === 'individual' && value.company_name) {
      return { error: 'Le nom de l\'entreprise ne peut pas être renseigné pour un person de type "individual"' };
    }

    // Validation de l'email si fourni
    if (value.email && !value.email.includes('@')) {
      return { error: 'Email invalide' };
    }

    return { value };
  }
}