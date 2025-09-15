import { query } from '../database/connection';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'user';
  telephone: string;
  avatar_url: string;
  company_id: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  password_hash?: string;
}

export class UserRepository {
  // Récupérer tous les utilisateurs
  static async findAll(): Promise<User[]> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at, last_login FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Récupérer tous les utilisateurs d'une entreprise
  static async findByCompany(): Promise<User[]> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at, last_login FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Récupérer un utilisateur par ID
  static async findById(userId: string): Promise<User | null> {
    const result = await query(
      'SELECT id, company_id, email, phone, avatar_url, first_name, last_name, role, is_active, email_verified, created_at, updated_at, last_login, email_verified FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // Récupérer un utilisateur par email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Créer un utilisateur
  static async create(userData: Partial<User>): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, role, company_id, password_hash, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at`,
      [
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.role || 'user',
        userData.company_id,
        userData.password_hash,
        userData.email_verified || false
      ]
    );
    return result.rows[0];
  }

  // Mettre à jour un utilisateur
  static async update(userId: string, userData: Partial<User>): Promise<User | null> {
    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at`,
      [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.role,
        userId
      ]
    );
    return result.rows[0] || null;
  }

  // Désactiver un utilisateur
  static async deactivate(userId: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  // Activer un utilisateur
  static async activate(userId: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  // Basculer le statut d'un utilisateur
  static async toggleStatus(userId: string): Promise<User | null> {
    const result = await query(
      `UPDATE users 
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // Vérifier si un utilisateur est admin
  static async isAdmin(userId: string): Promise<boolean> {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.role === 'admin';
  }

  // Mettre à jour le mot de passe
  static async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
    return result.rowCount > 0;
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(userId: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  // Supprimer un utilisateur
  static async delete(userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  // Compter les utilisateurs actifs
  static async countActive(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as total FROM users WHERE is_active = true'
    );
    return parseInt(result.rows[0].total);
  }

  // Compter les nouveaux utilisateurs du mois
  static async countNewThisMonth(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_TRUNC(\'month\', CURRENT_DATE)'
    );
    return parseInt(result.rows[0].total);
  }
}

export default UserRepository;
