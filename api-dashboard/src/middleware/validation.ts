import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from '@/middleware/errorHandler';

// Validation middleware factory
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate headers
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    if (validationErrors.length > 0) {
      return next(createError.badRequest(`Erreurs de validation: ${validationErrors.join(', ')}`));
    }

    next();
  };
};

// Common validation schemas
export const commonSchemas = {
  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required()
  }),

  // Pagination query
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().default('created_at')
  }),

  // Search query
  search: Joi.object({
    q: Joi.string().min(1).max(255),
    status: Joi.string(),
    category: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // Email
  email: Joi.string().email().required(),

  // Password
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    }),

  // Phone number (French format)
  phone: Joi.string().pattern(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),

  // SIRET number
  siret: Joi.string().pattern(/^\d{14}$/),

  // Postal code (French)
  postalCode: Joi.string().pattern(/^\d{5}$/)
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Les mots de passe ne correspondent pas' }),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    phone: commonSchemas.phone.optional()
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false)
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(100),
    lastName: Joi.string().min(2).max(100),
    phone: commonSchemas.phone.optional().allow('')
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Client validation schemas
export const clientSchemas = {
  create: Joi.object({
    type: Joi.string().valid('individual', 'company').default('individual'),
    firstName: Joi.string().min(2).max(100),
    lastName: Joi.string().min(2).max(100),
    companyName: Joi.string().max(200),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    mobile: commonSchemas.phone.optional(),
    addressLine1: Joi.string().max(255),
    addressLine2: Joi.string().max(255),
    city: Joi.string().max(100),
    postalCode: commonSchemas.postalCode.optional(),
    country: Joi.string().max(100).default('France'),
    siret: commonSchemas.siret.optional(),
    vatNumber: Joi.string().max(50),
    website: Joi.string().uri(),
    notes: Joi.string().max(1000),
    source: Joi.string().max(50),
    tags: Joi.array().items(Joi.string().max(50))
  }).custom((value, helpers) => {
    // Custom validation: require name fields based on type
    if (value.type === 'individual') {
      if (!value.firstName || !value.lastName) {
        return helpers.error('any.custom', { 
          message: 'Prénom et nom requis pour les particuliers' 
        });
      }
    } else if (value.type === 'company') {
      if (!value.companyName) {
        return helpers.error('any.custom', { 
          message: 'Nom de l\'entreprise requis pour les entreprises' 
        });
      }
    }
    return value;
  }),

  update: Joi.object({
    type: Joi.string().valid('individual', 'company'),
    firstName: Joi.string().min(2).max(100),
    lastName: Joi.string().min(2).max(100),
    companyName: Joi.string().max(200),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional().allow(''),
    mobile: commonSchemas.phone.optional().allow(''),
    addressLine1: Joi.string().max(255).allow(''),
    addressLine2: Joi.string().max(255).allow(''),
    city: Joi.string().max(100).allow(''),
    postalCode: commonSchemas.postalCode.optional().allow(''),
    country: Joi.string().max(100),
    siret: commonSchemas.siret.optional().allow(''),
    vatNumber: Joi.string().max(50).allow(''),
    website: Joi.string().uri().allow(''),
    notes: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('active', 'inactive', 'prospect'),
    source: Joi.string().max(50).allow(''),
    tags: Joi.array().items(Joi.string().max(50))
  })
};

// Message validation schemas
export const messageSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    company: Joi.string().max(200),
    subject: Joi.string().min(5).max(500).required(),
    message: Joi.string().min(10).max(5000).required(),
    type: Joi.string().valid('devis', 'information', 'partnership', 'support', 'other').default('other'),
    source: Joi.string().max(100)
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('unread', 'read', 'replied', 'archived').required(),
    assignedTo: Joi.string().guid({ version: 'uuidv4' }).optional(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional()
  })
};

// Publication validation schemas
export const publicationSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    content: Joi.string().min(10).max(10000).required(),
    excerpt: Joi.string().max(500),
    featuredImage: Joi.string().uri(),
    images: Joi.array().items(Joi.string().uri()),
    hashtags: Joi.array().items(Joi.string().max(50)),
    type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').default('standard'),
    status: Joi.string().valid('draft', 'scheduled', 'published').default('draft'),
    category: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    seoTitle: Joi.string().max(255),
    seoDescription: Joi.string().max(500),
    seoKeywords: Joi.array().items(Joi.string().max(50)),
    scheduledAt: Joi.date().iso().min('now'),
    platforms: Joi.array().items(Joi.string().valid('facebook', 'instagram', 'linkedin', 'website')).min(1)
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(255),
    content: Joi.string().min(10).max(10000),
    excerpt: Joi.string().max(500).allow(''),
    featuredImage: Joi.string().uri().allow(''),
    images: Joi.array().items(Joi.string().uri()),
    hashtags: Joi.array().items(Joi.string().max(50)),
    type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial'),
    status: Joi.string().valid('draft', 'scheduled', 'published'),
    category: Joi.string().max(100).allow(''),
    tags: Joi.array().items(Joi.string().max(50)),
    seoTitle: Joi.string().max(255).allow(''),
    seoDescription: Joi.string().max(500).allow(''),
    seoKeywords: Joi.array().items(Joi.string().max(50)),
    scheduledAt: Joi.date().iso().min('now').allow(null),
    platforms: Joi.array().items(Joi.string().valid('facebook', 'instagram', 'linkedin', 'website'))
  })
};

export default {
  validate,
  commonSchemas,
  userSchemas,
  clientSchemas,
  messageSchemas,
  publicationSchemas
};


