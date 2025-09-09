import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, transaction } from '@/database/connection';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    rememberMe?: boolean;
  };
}

// Generate JWT tokens
const generateTokens = (payload: { id: string; email: string; role: string }) => {
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });

  return { accessToken, refreshToken };
};

// Store refresh token in database
const storeRefreshToken = async (userId: string, refreshToken: string) => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

// Set secure cookies
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string, rememberMe = false) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// Register new user
export const register = asyncHandler(async (req: RegisterRequest, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw createError.conflict('Un utilisateur avec cet email existe déjà');
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const userResult = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id, email, first_name, last_name, role, created_at`,
    [email.toLowerCase(), passwordHash, firstName, lastName, phone, 'user', true] // Auto-verify for now
  );

  const user = userResult.rows[0];

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken);

  logger.info('User registered successfully', { 
    userId: user.id, 
    email: user.email,
    ip: req.ip 
  });

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      },
      accessToken
    }
  });
});

// Login user
export const login = asyncHandler(async (req: LoginRequest, res: Response, next: NextFunction) => {
  const { email, password, rememberMe = false } = req.body;

  // Find user
  const userResult = await query(
    `SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified, last_login
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (userResult.rows.length === 0) {
    throw createError.unauthorized('Email ou mot de passe incorrect');
  }

  const user = userResult.rows[0];

  // Check if account is active
  if (!user.is_active) {
    throw createError.forbidden('Compte désactivé');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    logger.warn('Failed login attempt', { 
      email, 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw createError.unauthorized('Email ou mot de passe incorrect');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Store refresh token and update last login
  await transaction(async (client) => {
    // Store refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Update last login
    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
  });

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken, rememberMe);

  logger.info('User logged in successfully', { 
    userId: user.id, 
    email: user.email,
    lastLogin: user.last_login,
    ip: req.ip 
  });

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        lastLogin: user.last_login
      },
      accessToken
    }
  });
});

// Refresh access token
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    throw createError.unauthorized('Refresh token requis');
  }

  try {
    // Verify refresh token
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(token, jwtRefreshSecret) as any;

    // Check if refresh token exists in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenResult = await query(
      `SELECT rt.*, u.email, u.role, u.is_active 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW() AND rt.is_revoked = false`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      throw createError.unauthorized('Refresh token invalide ou expiré');
    }

    const tokenData = tokenResult.rows[0];

    // Check if user is still active
    if (!tokenData.is_active) {
      throw createError.forbidden('Compte désactivé');
    }

    // Generate new access token
    const { accessToken } = generateTokens({
      id: tokenData.user_id,
      email: tokenData.email,
      role: tokenData.role
    });

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        accessToken
      }
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError.unauthorized('Refresh token invalide');
    }
    throw error;
  }
});

// Logout user
export const logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Revoke refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
      [tokenHash]
    );
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  logger.info('User logged out', { 
    userId: req.user?.id,
    ip: req.ip 
  });

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// Get current user profile
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw createError.unauthorized('Utilisateur non authentifié');
  }

  // Get detailed user info
  const userResult = await query(
    `SELECT id, email, first_name, last_name, phone, avatar_url, role, 
            is_active, email_verified, last_login, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    throw createError.notFound('Utilisateur non trouvé');
  }

  const user = userResult.rows[0];

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw createError.unauthorized('Utilisateur non authentifié');
  }

  const { firstName, lastName, phone } = req.body;

  const userResult = await query(
    `UPDATE users SET 
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       phone = COALESCE($3, phone),
       updated_at = NOW()
     WHERE id = $4
     RETURNING id, email, first_name, last_name, phone, avatar_url, role`,
    [firstName, lastName, phone, req.user.id]
  );

  if (userResult.rows.length === 0) {
    throw createError.notFound('Utilisateur non trouvé');
  }

  const user = userResult.rows[0];

  logger.info('User profile updated', { 
    userId: user.id,
    changes: { firstName, lastName, phone }
  });

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: user.role
      }
    }
  });
});

// Change password
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw createError.unauthorized('Utilisateur non authentifié');
  }

  const { currentPassword, newPassword } = req.body;

  // Get current password hash
  const userResult = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    throw createError.notFound('Utilisateur non trouvé');
  }

  const user = userResult.rows[0];

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw createError.badRequest('Mot de passe actuel incorrect');
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password and revoke all refresh tokens
  await transaction(async (client) => {
    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user!.id]
    );

    // Revoke all refresh tokens for security
    await client.query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
      [req.user!.id]
    );
  });

  // Clear cookies to force re-login
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  logger.info('User password changed', { 
    userId: req.user.id,
    ip: req.ip 
  });

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.'
  });
});

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
