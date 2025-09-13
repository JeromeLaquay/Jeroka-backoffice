import Joi from 'joi';
import { PublicationStatus, PublicationType } from '../repositories/publicationRepository';

export const publicationSchemas = {
  filters: Joi.object({
    search: Joi.string().max(200).optional(),
    status: Joi.string().valid('draft', 'scheduled', 'published').optional(),
    platform: Joi.string().max(50).optional(),
    category: Joi.string().max(100).optional(),
    type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'published_at', 'scheduled_at', 'title', 'status').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    content: Joi.string().min(3).required(),
    hashtags: Joi.string().allow('', null).optional(),
    image: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    platforms: Joi.array().items(Joi.string()).min(1).required(),
    type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').required(),
    status: Joi.string().valid('draft', 'scheduled', 'published').required(),
    category: Joi.string().allow('', null).optional(),
    keywords: Joi.string().allow('', null).optional(),
    scheduled_at: Joi.string().isoDate().allow(null).optional(),
    author_id: Joi.string().uuid().allow(null).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    content: Joi.string().min(3).optional(),
    hashtags: Joi.string().allow('', null).optional(),
    image: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    platforms: Joi.array().items(Joi.string()).min(1).optional(),
    type: Joi.string().valid('standard', 'promotion', 'event', 'announcement', 'tutorial').optional(),
    status: Joi.string().valid('draft', 'scheduled', 'published').optional(),
    category: Joi.string().allow('', null).optional(),
    keywords: Joi.string().allow('', null).optional(),
    scheduled_at: Joi.string().isoDate().allow(null).optional(),
    author_id: Joi.string().uuid().allow(null).optional()
  })
};

export class PublicationValidation {
  static validateFilters(filters: any) {
    return publicationSchemas.filters.validate(filters, { abortEarly: false, stripUnknown: true });
  }
  static validateCreate(data: any) {
    return publicationSchemas.create.validate(data, { abortEarly: false, stripUnknown: true });
  }
  static validateUpdate(data: any) {
    return publicationSchemas.update.validate(data, { abortEarly: false, stripUnknown: true });
  }
}


