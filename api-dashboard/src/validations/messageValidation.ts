import Joi from 'joi';

export const messageSchemas = {
  create: Joi.object({
    first_name: Joi.string().min(1).max(100).required(),
    last_name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(null, '').optional(),
    company: Joi.string().allow(null, '').optional(),
    subject: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(5000).required(),
    status: Joi.string().valid('new', 'read', 'replied', 'archived').default('new'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    source: Joi.string().allow(null, '').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  update: Joi.object({
    first_name: Joi.string().min(1).max(100).optional(),
    last_name: Joi.string().min(1).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().allow(null, '').optional(),
    company: Joi.string().allow(null, '').optional(),
    subject: Joi.string().min(1).max(200).optional(),
    message: Joi.string().min(1).max(5000).optional(),
    status: Joi.string().valid('new', 'read', 'replied', 'archived').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    source: Joi.string().allow(null, '').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    prompt: Joi.string().optional(),
    response: Joi.string().optional()
  }),

  filters: Joi.object({
    search: Joi.string().max(100).allow('').optional(),
    status: Joi.string().valid('new', 'read', 'replied', 'archived').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    source: Joi.string().max(100).allow('').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'priority', 'status', 'subject').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

export class MessageValidation {
  static validateCreate(data: any) {
    return messageSchemas.create.validate(data, { abortEarly: false, stripUnknown: true });
  }

  static validateUpdate(data: any) {
    return messageSchemas.update.validate(data, { abortEarly: false, stripUnknown: true });
  }

  static validateFilters(filters: any) {
    return messageSchemas.filters.validate(filters, { abortEarly: false, stripUnknown: true });
  }
}
