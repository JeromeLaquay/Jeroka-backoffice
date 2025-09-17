// api-dashboard/src/repositories/socialCredentialsRepository.ts
import { query } from '../database/connection';
import { EncryptionService } from '../services/encryptionService';

export interface SocialCredentials {
  id: string;
  companyId: string;
  platform: 'facebook' | 'linkedin' | 'twitter' | 'google';
  credentials: any; // Déchiffré
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  decryptedCredentials: {
    oauthClientId: boolean;
    oauthClientSecret: boolean;
    redirectUri: boolean;
  };
}

export class SocialCredentialsRepository {
  static async create(companyId: string | null, userId: string | null, platform: string, credentials: any): Promise<SocialCredentials> {
    const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));
    
    const sql = `
      INSERT INTO company_social_credentials 
      (company_id, user_id, platform, encrypted_credentials, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await query(sql, [
      companyId,
      userId,
      platform,
      encryptedCredentials,
      credentials.expiresAt || null
    ]);
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async getByCompanyAndPlatform(companyId: string, platform: string): Promise<SocialCredentials | null> {
    const sql = `
      SELECT * FROM company_social_credentials 
      WHERE company_id = $1 AND platform = $2 AND is_active = true
    `;
    
    const result = await query(sql, [companyId, platform]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async getByUserIdAndPlatform(userId: string, platform: string): Promise<SocialCredentials | null> {
    const sql = `
      SELECT * FROM company_social_credentials 
      WHERE user_id = $1 AND platform = $2 AND is_active = true
    `;
    
    const result = await query(sql, [userId, platform]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async getByCompany(companyId: string): Promise<SocialCredentials[]> {
    const sql = `
      SELECT * FROM company_social_credentials 
      WHERE company_id = $1 AND is_active = true
      ORDER BY platform
    `;
    
    const result = await query(sql, [companyId]);
    
    return result.rows.map((row: any) => this.mapRowToCredentials(row));
  }

  static async update(companyId: string | null, userId: string | null, platform: string, credentials: any): Promise<SocialCredentials> {
    const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));
    
    const sql = `
      UPDATE company_social_credentials 
      SET encrypted_credentials = $1, expires_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE (company_id = $3 AND platform = $5) OR (user_id = $4 AND platform = $5)
      RETURNING *
    `;
    
    const result = await query(sql, [
      encryptedCredentials,
      credentials.expiresAt || null,
      companyId,
      userId,
      platform
    ]);
    
    return this.mapRowToCredentials(result.rows[0]);
  }

  static async upsertGoogle( userId: string, platform: string, credentials: any): Promise<SocialCredentials> {
    const existing = await this.getByUserIdAndPlatform(userId, platform);
    if (existing) {
      return this.update(null , userId, platform, credentials);
    }
    return this.create(null , userId, platform, credentials);
  }

  static async upsert(companyId: string, platform: string, credentials: any): Promise<SocialCredentials> {
    const existing = await this.getByCompanyAndPlatform(companyId, platform);
    if (existing) {
      return this.update(companyId, null, platform, credentials);
    }
    return this.create(companyId, null, platform, credentials);
  }

  static async deactivate(companyId: string | null, userId: string | null, platform: string): Promise<void> {
    const sql = `
      UPDATE company_social_credentials 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE (company_id = $1 AND platform = $3) OR (user_id = $2 AND platform = $3)
    `;
    
    await query(sql, [companyId, userId, platform]);
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
      updatedAt: row.updated_at,
      decryptedCredentials: {
        oauthClientId: row.decryptedCredentials.oauth_client_id,
        oauthClientSecret: row.decryptedCredentials.oauth_client_secret,
        redirectUri: row.decryptedCredentials.redirect_uri
      }
    };
  }
}