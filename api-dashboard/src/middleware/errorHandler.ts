import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper function to create common errors
export const createError = {
  badRequest: (message: string = 'Requête invalide') => new AppError(message, 400, 'BAD_REQUEST'),
  unauthorized: (message: string = 'Non autorisé') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message: string = 'Accès interdit') => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (message: string = 'Ressource non trouvée') => new AppError(message, 404, 'NOT_FOUND'),
  conflict: (message: string = 'Conflit') => new AppError(message, 409, 'CONFLICT'),
  unprocessable: (message: string = 'Données non traitables') => new AppError(message, 422, 'UNPROCESSABLE_ENTITY'),
  internal: (message: string = 'Erreur interne du serveur') => new AppError(message, 500, 'INTERNAL_ERROR'),
  tooManyRequests: (message: string = 'Trop de requêtes') => new AppError(message, 429, 'TOO_MANY_REQUESTS')
};

// Database error handler
const handleDatabaseError = (error: any): AppError => {
  if (error.code === '23505') { // Unique violation
    const field = error.detail?.match(/Key \(([^)]+)\)/)?.[1] || 'field';
    return createError.conflict(`Cette valeur pour ${field} existe déjà`);
  }
  
  if (error.code === '23503') { // Foreign key violation
    return createError.badRequest('Référence invalide vers une ressource');
  }
  
  if (error.code === '23502') { // Not null violation
    const field = error.column || 'field';
    return createError.badRequest(`Le champ ${field} est requis`);
  }
  
  if (error.code === '22001') { // String data right truncation
    return createError.badRequest('Données trop longues pour le champ');
  }
  
  if (error.code === '42703') { // Undefined column
    return createError.badRequest('Champ de base de données invalide');
  }

  // Connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return createError.internal('Erreur de connexion à la base de données');
  }

  return createError.internal('Erreur de base de données');
};

// JWT error handler
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return createError.unauthorized('Token invalide');
  }
  
  if (error.name === 'TokenExpiredError') {
    return createError.unauthorized('Token expiré');
  }
  
  if (error.name === 'NotBeforeError') {
    return createError.unauthorized('Token pas encore valide');
  }

  return createError.unauthorized('Erreur d\'authentification');
};

// Validation error handler
const handleValidationError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.details || {})
      .map((detail: any) => detail.message)
      .join(', ');
    return createError.badRequest(`Erreur de validation: ${messages}`);
  }

  return createError.badRequest('Erreur de validation');
};

// Send error response
const sendErrorResponse = (error: ApiError, req: Request, res: Response) => {
  const { statusCode = 500, message, code, stack } = error;

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: {
        message,
        code,
        stack,
        statusCode
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  } else {
    logger.warn('Client Error:', {
      error: { message, code, statusCode },
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      }
    });
  }

  // Error response structure
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code: code || 'UNKNOWN_ERROR',
      statusCode
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && stack) {
    errorResponse.error.stack = stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Main error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: ApiError;

  // If it's already an AppError, use it as is
  if (error instanceof AppError) {
    appError = error;
  } 
  // Handle specific error types
  else if (error.code && error.code.startsWith('23')) {
    // Database constraint errors
    appError = handleDatabaseError(error);
  }
  else if (error.name && ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
    // JWT errors
    appError = handleJWTError(error);
  }
  else if (error.name === 'ValidationError' || error.isJoi) {
    // Validation errors
    appError = handleValidationError(error);
  }
  else if (error.name === 'MulterError') {
    // File upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      appError = createError.badRequest('Fichier trop volumineux');
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      appError = createError.badRequest('Trop de fichiers');
    } else {
      appError = createError.badRequest('Erreur lors du téléchargement');
    }
  }
  else if (error.type === 'entity.parse.failed') {
    // JSON parsing errors
    appError = createError.badRequest('Format JSON invalide');
  }
  else if (error.type === 'entity.too.large') {
    // Request too large
    appError = createError.badRequest('Requête trop volumineuse');
  }
  // Default to internal server error
  else {
    appError = createError.internal(
      process.env.NODE_ENV === 'production' 
        ? 'Une erreur interne s\'est produite' 
        : error.message
    );
    appError.stack = error.stack;
  }

  sendErrorResponse(appError, req, res);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const error = createError.notFound(`Route ${req.originalUrl} non trouvée`);
  sendErrorResponse(error, req, res);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { AppError };
export default errorHandler;


