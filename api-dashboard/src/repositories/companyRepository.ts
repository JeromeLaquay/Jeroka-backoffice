import { query } from '../database/connection';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  siret?: string;
  tax_regime?: string;
  banking_info?: any;
  invoice_settings?: any;
  quote_settings?: any;
  email_settings?: any;
  theme?: string;
  is_active: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
  user_count?: number;
  google_calendar_id?: string;
  google_drive_folder_id?: string;
  google_mail_id?: string;
}

export interface CompanyFilters {
  search?: string;
  status?: 'active' | 'inactive';
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'subscription_plan';
  sort_order?: 'asc' | 'desc';
}

export interface CompanySettings {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  siret?: string;
  tax_regime?: string;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  is_active?: boolean;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  siret?: string;
  tax_regime?: string;
  banking_info?: any;
  invoice_settings?: any;
  quote_settings?: any;
  email_settings?: any;
  theme?: string;
  is_active?: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: Date;
}

export class CompanyRepository {
  /**
   * Récupère une entreprise par son ID
   */
  static async findById(companyId: string): Promise<Company | null> {
    const result = await query(`
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [companyId]);
    return result.rows[0] || null;
  }

  /**
   * Récupère toutes les entreprises avec filtres et pagination
   */
  static async findAll(filters: CompanyFilters): Promise<{ data: Company[], total: number }> {
    let queryStr = `
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (filters.search) {
      paramCount++;
      conditions.push(`(c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`);
      params.push(`%${filters.search}%`);
    }

    if (filters.status) {
      paramCount++;
      conditions.push(`c.is_active = $${paramCount}`);
      params.push(filters.status === 'active');
    }

    if (filters.subscription_plan) {
      paramCount++;
      conditions.push(`c.subscription_plan = $${paramCount}`);
      params.push(filters.subscription_plan);
    }

    if (filters.subscription_status) {
      paramCount++;
      conditions.push(`c.subscription_status = $${paramCount}`);
      params.push(filters.subscription_status);
    }

    if (filters.created_from) {
      paramCount++;
      conditions.push(`c.created_at >= $${paramCount}`);
      params.push(filters.created_from);
    }

    if (filters.created_to) {
      paramCount++;
      conditions.push(`c.created_at <= $${paramCount}`);
      params.push(filters.created_to);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' GROUP BY c.id';

    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Tri
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'desc';
      queryStr += ` ORDER BY c.${filters.sort_by} ${sortOrder.toUpperCase()}`;
    } else {
      queryStr += ' ORDER BY c.created_at DESC';
    }

    // Pagination
    if (filters.limit) {
      paramCount++;
      queryStr += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters.page && filters.limit) {
      paramCount++;
      queryStr += ` OFFSET $${paramCount}`;
      params.push((filters.page - 1) * filters.limit);
    }

    const result = await query(queryStr, params);
    return { data: result.rows, total };
  }

  /**
   * Crée une nouvelle entreprise
   */
  static async create(companyData: CreateCompanyData): Promise<Company> {
    const result = await query(`
      INSERT INTO companies (
        name, email, phone, address_line1, address_line2, city, 
        postal_code, country, vat_number, siret, tax_regime, 
        subscription_plan, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      companyData.name,
      companyData.email,
      companyData.phone || null,
      companyData.address_line1 || null,
      companyData.address_line2 || null,
      companyData.city || null,
      companyData.postal_code || null,
      companyData.country || null,
      companyData.vat_number || null,
      companyData.siret || null,
      companyData.tax_regime || null,
      companyData.subscription_plan || 'free',
      companyData.is_active !== undefined ? companyData.is_active : true
    ]);
    
    return result.rows[0];
  }

  /**
   * Met à jour une entreprise
   */
  static async update(companyId: string, companyData: UpdateCompanyData): Promise<Company | null> {
    const fields = [];
    const params = [];
    let paramCount = 0;

    Object.entries(companyData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'user_count') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(companyId);
    }

    fields.push(`updated_at = NOW()`);
    paramCount++;
    params.push(companyId);

    const result = await query(`
      UPDATE companies 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);
    
    return result.rows[0] || null;
  }

  /**
   * Supprime une entreprise
   */
  static async delete(companyId: string): Promise<boolean> {
    const result = await query('DELETE FROM companies WHERE id = $1', [companyId]);
    return result.rowCount > 0;
  }

  /**
   * Bascule le statut actif/inactif d'une entreprise
   */
  static async toggleStatus(companyId: string): Promise<Company | null> {
    const result = await query(`
      UPDATE companies 
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [companyId]);
    
    return result.rows[0] || null;
  }

  /**
   * Récupère les paramètres d'une entreprise
   */
  static async getSettings(companyId: string): Promise<CompanySettings | null> {
    const result = await query('SELECT * FROM company_settings WHERE company_id = $1', [companyId]);
    return result.rows[0] || null;
  }

  /**
   * Met à jour les paramètres d'une entreprise
   */
  static async updateSettings(companyId: string, settings: Partial<CompanySettings>): Promise<CompanySettings | null> {
    const fields = [];
    const params = [];
    let paramCount = 0;

    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      return this.getSettings(companyId);
    }

    fields.push(`updated_at = NOW()`);
    paramCount++;
    params.push(companyId);

    const result = await query(`
      UPDATE company_settings 
      SET ${fields.join(', ')}
      WHERE company_id = $${paramCount}
      RETURNING *
    `, params);
    
    return result.rows[0] || null;
  }

  /**
   * Supprime les paramètres d'une entreprise
   */
  static async deleteSettings(companyId: string): Promise<boolean> {
    const result = await query('DELETE FROM company_settings WHERE company_id = $1', [companyId]);
    return result.rowCount > 0;
  }

  /**
   * Récupère les utilisateurs d'une entreprise
   */
  static async getUsers(companyId: string): Promise<CompanyUser[]> {
    const result = await query(`
      SELECT u.id, u.first_name || ' ' || u.last_name as name, u.email, u.telephone as phone
      FROM users u
      WHERE u.company_id = $1
      ORDER BY u.created_at DESC
    `, [companyId]);
    return result.rows;
  }

  /**
   * Vérifie si une entreprise existe
   */
  static async exists(companyId: string): Promise<boolean> {
    const result = await query('SELECT 1 FROM companies WHERE id = $1', [companyId]);
    return result.rows.length > 0;
  }

  /**
   * Récupère les statistiques d'une entreprise
   */
  static async getStats(companyId: string): Promise<{
    user_count: number;
    invoice_count: number;
    quote_count: number;
    client_count: number;
  }> {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE company_id = $1) as user_count,
        (SELECT COUNT(*) FROM invoices WHERE company_id = $1) as invoice_count,
        (SELECT COUNT(*) FROM quotes WHERE company_id = $1) as quote_count,
        (SELECT COUNT(*) FROM clients WHERE company_id = $1) as client_count
    `, [companyId]);
    
    return result.rows[0];
  }
}

export default CompanyRepository;
