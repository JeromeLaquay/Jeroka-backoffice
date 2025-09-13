import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    company_id: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Verify JWT token
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookies as fallback
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw createError.unauthorized('Token d\'accès requis');
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError.internal('Configuration JWT manquante');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Get user from database
    const userResult = await query(
      `SELECT id, email, first_name, last_name, role, company_id, is_active, email_verified 
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      throw createError.unauthorized('Utilisateur non trouvé');
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw createError.forbidden('Compte désactivé');
    }

    // Check if email is verified (optional, depending on requirements)
    if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      throw createError.forbidden('Email non vérifié');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      company_id: user.company_id
    };

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError.unauthorized('Token invalide'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError.unauthorized('Token expiré'));
    }
    next(error);
  }
};

// Check if user has required role
export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError.unauthorized('Authentification requise'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl
      });
      
      return next(createError.forbidden('Permissions insuffisantes'));
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('admin');

// Manager or Admin middleware
export const requireManager = requireRole(['admin', 'manager']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookies as fallback
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
          
          const userResult = await query(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
            [decoded.id]
          );

          if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
            const user = userResult.rows[0];
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.first_name,
              lastName: user.last_name,
              company_id: user.company_id
            };
          }
        } catch (error) {
          // Ignore token errors in optional auth
          logger.debug('Optional auth token error:', error);
        }
      }
    }

    next();
  } catch (error) {
    // In optional auth, we don't fail on errors
    next();
  }
};

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (userIdField: string = 'user_id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError.unauthorized('Authentification requise'));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.id !== resourceUserId) {
      return next(createError.forbidden('Accès non autorisé à cette ressource'));
    }

    next();
  };
};

export default {
  verifyToken,
  requireRole,
  requireAdmin,
  requireManager,
  optionalAuth,
  requireOwnershipOrAdmin
};
