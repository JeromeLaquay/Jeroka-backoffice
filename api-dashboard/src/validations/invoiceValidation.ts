import Joi from 'joi';

// Schémas de validation pour les factures
export const invoiceSchemas = {
  // Validation pour la création d'une facture
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
    due_date: Joi.date().greater('now').required(),
    notes: Joi.string().max(1000).optional(),
    status: Joi.string().valid('draft', 'sent').default('draft')
  }),

  // Validation pour la mise à jour d'une facture
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
    due_date: Joi.date().greater('now').optional(),
    notes: Joi.string().max(1000).optional(),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional()
  }),

  // Validation pour les filtres de recherche
  filters: Joi.object({
    search: Joi.string().max(100).optional(),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
    clientId: Joi.string().uuid().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'invoice_number', 'due_date', 'total').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10)
  }),

  // Validation pour l'ID facture
  invoiceId: Joi.string().uuid().required(),

  // Validation pour l'ID client
  clientId: Joi.string().uuid().required(),

  // Validation pour le statut
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').required(),

  // Validation pour le marquage comme payée
  markAsPaid: Joi.object({
    paid_date: Joi.date().max('now').optional(),
    payment_method: Joi.string().max(50).optional(),
    payment_reference: Joi.string().max(100).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Validation pour l'envoi de facture
  sendInvoice: Joi.object({
    email: Joi.string().email().optional(),
    subject: Joi.string().max(200).optional(),
    message: Joi.string().max(1000).optional(),
    send_copy: Joi.boolean().default(false)
  }),

  // Validation pour la création à partir d'un devis
  createFromQuote: Joi.object({
    quote_id: Joi.string().uuid().required(),
    due_date: Joi.date().greater('now').optional(),
    notes: Joi.string().max(1000).optional()
  })
};

// Fonctions de validation
export class InvoiceValidation {
  /**
   * Valide les données de création d'une facture
   */
  static validateCreate(data: any): { error?: string; value?: any } {
    const { error, value } = invoiceSchemas.create.validate(data, {
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
   * Valide les données de mise à jour d'une facture
   */
  static validateUpdate(data: any): { error?: string; value?: any } {
    const { error, value } = invoiceSchemas.update.validate(data, {
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
    const { error, value } = invoiceSchemas.filters.validate(filters, {
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
   * Valide un ID facture
   */
  static validateInvoiceId(invoiceId: string): { error?: string; value?: string } {
    const { error, value } = invoiceSchemas.invoiceId.validate(invoiceId);
    
    if (error) {
      return { error: 'ID facture invalide' };
    }

    return { value };
  }

  /**
   * Valide un ID client
   */
  static validateClientId(clientId: string): { error?: string; value?: string } {
    const { error, value } = invoiceSchemas.clientId.validate(clientId);
    
    if (error) {
      return { error: 'ID client invalide' };
    }

    return { value };
  }

  /**
   * Valide un statut de facture
   */
  static validateStatus(status: string): { error?: string; value?: string } {
    const { error, value } = invoiceSchemas.status.validate(status);
    
    if (error) {
      return { error: 'Statut de facture invalide' };
    }

    return { value };
  }

  /**
   * Valide les données de marquage comme payée
   */
  static validateMarkAsPaid(data: any): { error?: string; value?: any } {
    const { error, value } = invoiceSchemas.markAsPaid.validate(data, {
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
   * Valide les données d'envoi de facture
   */
  static validateSendInvoice(data: any): { error?: string; value?: any } {
    const { error, value } = invoiceSchemas.sendInvoice.validate(data, {
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
   * Valide les données de création à partir d'un devis
   */
  static validateCreateFromQuote(data: any): { error?: string; value?: any } {
    const { error, value } = invoiceSchemas.createFromQuote.validate(data, {
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
      return { error: 'Au moins un article est requis pour créer une facture' };
    }

    // Vérifier que la date d'échéance est dans le futur
    const dueDate = new Date(value.due_date);
    const now = new Date();
    if (dueDate <= now) {
      return { error: 'La date d\'échéance doit être dans le futur' };
    }

    // Vérifier que la date d'échéance n'est pas trop éloignée (max 1 an)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (dueDate > oneYearFromNow) {
      return { error: 'La date d\'échéance ne peut pas dépasser 1 an' };
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

    // Vérifier la date d'échéance si fournie
    if (value.due_date) {
      const dueDate = new Date(value.due_date);
      const now = new Date();
      if (dueDate <= now) {
        return { error: 'La date d\'échéance doit être dans le futur' };
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (dueDate > oneYearFromNow) {
        return { error: 'La date d\'échéance ne peut pas dépasser 1 an' };
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

