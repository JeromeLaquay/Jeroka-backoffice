// api-dashboard/src/repositories/socialCredentialsRepository.ts
import { DatabaseConnection } from '../database/connection';
import { EncryptionService } from '../services/encryptionService';

export interface SocialCredentials {
  id: string;
  companyId: string;
  platform: 'facebook' | 'linkedin' | 'twitter';
  credentials: any; // Déchiffré
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SocialCredentialsRepository {
  static async create(companyId: string, platform: string, credentials: any): Promise<SocialCredentials> {
    const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));
    
    const query = `
      INSERT INTO company_social_credentials 
      (company_id, platform, encrypted_credentials, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await DatabaseConnection.query(query, [
      companyId,
      platform,
      encryptedCredentials,
      credentials.expiresAt || null
    ]);
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async getByCompanyAndPlatform(companyId: string, platform: string): Promise<SocialCredentials | null> {
    const query = `
      SELECT * FROM company_social_credentials 
      WHERE company_id = $1 AND platform = $2 AND is_active = true
    `;
    
    const result = await DatabaseConnection.query(query, [companyId, platform]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async getByCompany(companyId: string): Promise<SocialCredentials[]> {
    const query = `
      SELECT * FROM company_social_credentials 
      WHERE company_id = $1 AND is_active = true
      ORDER BY platform
    `;
    
    const result = await DatabaseConnection.query(query, [companyId]);
    
    return result.rows.map(row => this.mapRowToCredentials(row));
  }

  static async update(companyId: string, platform: string, credentials: any): Promise<SocialCredentials> {
    const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));
    
    const query = `
      UPDATE company_social_credentials 
      SET encrypted_credentials = $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = $3 AND platform = $4
      RETURNING *
    `;
    
    const result = await DatabaseConnection.query(query, [
      encryptedCredentials,
      credentials.expiresAt || null,
      companyId,
      platform
    ]);
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async deactivate(companyId: string, platform: string): Promise<void> {
    const query = `
      UPDATE company_social_credentials 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE company_id = $1 AND platform = $2
    `;
    
    await DatabaseConnection.query(query, [companyId, platform]);
  }

  private static mapRowToCredentials(row: any): SocialCredentials {
    const decryptedCredentials = EncryptionService.decrypt(row.encrypted_credentials);
    
    return {
      id: row.id,
      companyId: row.company_id,
      platform: row.platform,
      credentials: JSON.parse(decryptedCredentials),
      isActive: row.is_active,
      expiresAt: row.expires_at,
      lastUsedAt: row.last_used_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}