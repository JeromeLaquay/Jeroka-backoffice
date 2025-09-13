import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

class DatabaseConnection {
  private pool: Pool | null = null;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    // Récupérer et valider les variables d'environnement
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'jeroka_dashboard',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.DB_SSL === 'false' ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false)
    };

    // Log de la configuration (sans mot de passe)
    logger.info('Configuration de base de données:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });

    // Vérifier que le mot de passe est une chaîne
    if (typeof dbConfig.password !== 'string') {
      logger.error('Le mot de passe de la base de données doit être une chaîne de caractères');
      throw new Error('Configuration de base de données invalide: mot de passe manquant');
    }

    this.pool = new Pool(dbConfig);

    // Connection error handling
    this.pool.on('error', (err) => {
      logger.error('Erreur inattendue sur le client PostgreSQL inactif', err);
    });

    this.pool.on('connect', () => {
      logger.info('Nouvelle connexion PostgreSQL établie');
    });

    this.pool.on('remove', () => {
      logger.info('Connexion PostgreSQL fermée');
    });
  }

  async connect(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool de connexions non initialisé');
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Connexion à PostgreSQL réussie');
    } catch (error) {
      logger.error('Erreur de connexion à PostgreSQL:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Pool de connexions non initialisé');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn(`Requête lente détectée: ${duration}ms`, { query: text });
      }
      
      return result;
    } catch (error) {
      logger.error('Erreur lors de l\'exécution de la requête:', { error, query: text, params });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Pool de connexions non initialisé');
    }
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Pool de connexions PostgreSQL fermé');
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as healthy');
      return result.rows[0].healthy === 1;
    } catch {
      return false;
    }
  }

  // Get connection info
  getStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Singleton instance
const db = new DatabaseConnection();

export const connectDatabase = () => db.connect();
export const query = (text: string, params?: any[]) => db.query(text, params);
export const getClient = () => db.getClient();
export const transaction = <T>(callback: (client: PoolClient) => Promise<T>) => db.transaction(callback);
export const closeDatabase = () => db.close();
export const isDatabaseHealthy = () => db.isHealthy();
export const getDatabaseStats = () => db.getStats();

export default db;