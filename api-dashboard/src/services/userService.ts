import { query } from '../database/connection';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export class UserService {
  // Récupérer tous les utilisateurs d'une entreprise
  static async getUsers(companyId: string): Promise<User[]> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at, last_login FROM users WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return result.rows;
  }

  // Récupérer un utilisateur par ID
  static async getUser(userId: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at, last_login FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // Récupérer l'utilisateur actuel (via token)
  static async getCurrentUser(userId: string): Promise<User | null> {
    return this.getUser(userId);
  }

  // Créer un utilisateur
  static async createUser(userData: Partial<User>): Promise<User> {
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
  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
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
  static async deactivateUser(userId: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }
}