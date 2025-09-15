import { Router } from 'express';
import authController from '../controllers/authController';
import { validate, userSchemas } from '../middleware/validation';
import { verifyToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Auth-specific rate limiters
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Trop de tentatives d\'inscription, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives de connexion, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
  registerLimiter,
  validate({ body: userSchemas.register }),
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login',
  loginLimiter,
  validate({ body: userSchemas.login }),
  authController.login
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public (requires refresh token in cookies)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', verifyToken, authController.getProfile);

/**
 * @route PUT /api/v1/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  verifyToken,
  validate({ body: userSchemas.updateProfile }),
  authController.updateProfile
);

/**
 * @route PUT /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password',
  verifyToken,
  validate({ body: userSchemas.changePassword }),
  authController.changePassword
);

export default router;
