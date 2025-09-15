// module-alias désactivé en dev (tsx gère les paths via tsconfig)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { connectDatabase } from './database/connection';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import messagesRoutes from './routes/messages';
import clientsRoutes from './routes/clients';
import publicationsRoutes from './routes/publications';
import productsRoutes from './routes/products';
import invoicesRoutes from './routes/invoices';
import quotesRoutes from './routes/quotes';
import dashboardRoutes from './routes/dashboard';
import emailsRoutes from './routes/emails';
import announcementsRoutes from './routes/announcements';
import calendarRoutes from './routes/calendar';
import socialNetworksRoutes from './routes/socialNetworks';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting (global): plus permissif et ignore certaines routes
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'development' ? '2000' : '600')
  ),
  skip: (req) => req.path === '/health' || req.path.startsWith('/api/v1/auth/') || req.path.startsWith('/api/v1/admin/'),
  message: {
    error: 'Trop de requêtes de cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKOFFICE_URL || 'http://localhost:3001',
    'https://backoffice.jerokaxperience.fr',  // Ajouter explicitement
    'https://apibackoffice.jerokaxperience.fr'  // Ajouter explicitement
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Rate limiting
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Jeroka API Dashboard',
    version: '1.0.0'
  });
});

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/messages`, messagesRoutes);
app.use(`${API_PREFIX}/clients`, clientsRoutes);
app.use(`${API_PREFIX}/publications`, publicationsRoutes);
app.use(`${API_PREFIX}/products`, productsRoutes);
app.use(`${API_PREFIX}/invoices`, invoicesRoutes);
app.use(`${API_PREFIX}/quotes`, quotesRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/emails`, emailsRoutes);
app.use(`${API_PREFIX}/announcements`, announcementsRoutes);
app.use(`${API_PREFIX}/calendar`, calendarRoutes);
app.use(`${API_PREFIX}/social-networks`, socialNetworksRoutes);
app.use(`${API_PREFIX}`, adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Base de données connectée avec succès');

    // Create HTTP server with extended timeouts
    const server = createServer(app);
    
    // Configure server timeouts
    server.timeout = 300000; // 5 minutes
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    server.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
      logger.info(`📊 API Dashboard accessible sur http://localhost:${PORT}`);
      logger.info(`🏥 Health check : http://localhost:${PORT}/health`);
      logger.info(`📚 API Base URL : http://localhost:${PORT}${API_PREFIX}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM reçu, arrêt du serveur...');
      server.close(() => {
        logger.info('Serveur fermé');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT reçu, arrêt du serveur...');
      server.close(() => {
        logger.info('Serveur fermé');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Exception non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejection non gérée à:', promise, 'raison:', reason);
  process.exit(1);
});

startServer();

export default app;
