import { query } from '../database/connection';

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
   client_name?: string;
  company_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total: number;
  tax: number;
  subtotal: number;
  valid_until: Date;
  issue_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  client?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
  created_at: Date;
}

export interface CreateQuoteData {
  quote_number?: string;
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total: number;
  tax: number;
  subtotal: number;
  valid_until: Date;
  issue_date: Date;
  notes?: string;
}

export interface UpdateQuoteData {
  client_id?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total?: number;
  tax?: number;
  subtotal?: number;
  valid_until?: Date;
  notes?: string;
  updated_at?: Date;
}

export interface CreateQuoteItemData {
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
}

export class QuoteRepository {
  /**
   * Récupère tous les devis d'une entreprise
   */
  static async findByCompanyId(companyId: string, filters?: {
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ quotes: Quote[], total: number }> {
    let queryStr = `
      SELECT 
        q.id,
        q.quote_number,
        q.client_id,
        q.company_id,
        q.status,
        q.total_ttc as total,
        q.total_vat as tax,
        q.subtotal_ht as subtotal,
        q.valid_until,
        q.created_at as issue_date,
        q.notes,
        q.created_at,
        q.updated_at,
        c.company_name as client_name,
        c.first_name,
        c.last_name,
        c.email,
        c.avatar_url
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.company_id = $1
    `;
    
    const params: any[] = [companyId];
    let paramCount = 1;

    if (filters?.status) {
      paramCount++;
      queryStr += ` AND q.status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters?.clientId) {
      paramCount++;
      queryStr += ` AND q.client_id = $${paramCount}`;
      params.push(filters.clientId);
    }

    if (filters?.dateFrom) {
      paramCount++;
      queryStr += ` AND q.created_at >= $${paramCount}`;
      params.push(filters.dateFrom);
    }

    if (filters?.dateTo) {
      paramCount++;
      queryStr += ` AND q.created_at <= $${paramCount}`;
      params.push(filters.dateTo);
    }

    queryStr += ` ORDER BY q.created_at DESC`;

    if (filters?.limit) {
      paramCount++;
      queryStr += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      paramCount++;
      queryStr += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(queryStr, params);
    
    // Compter le total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM quotes q
      WHERE q.company_id = $1
    `;
    const countParams: any[] = [companyId];
    let countParamCount = 1;

    if (filters?.status) {
      countParamCount++;
      countQuery += ` AND q.status = $${countParamCount}`;
      countParams.push(filters.status);
    }

    if (filters?.clientId) {
      countParamCount++;
      countQuery += ` AND q.client_id = $${countParamCount}`;
      countParams.push(filters.clientId);
    }

    if (filters?.dateFrom) {
      countParamCount++;
      countQuery += ` AND q.created_at >= $${countParamCount}`;
      countParams.push(filters.dateFrom);
    }

    if (filters?.dateTo) {
      countParamCount++;
      countQuery += ` AND q.created_at <= $${countParamCount}`;
      countParams.push(filters.dateTo);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return {
      quotes: result.rows.map((row: any) => ({
        id: row.id,
        quote_number: row.quote_number,
        client_id: row.client_id,
        company_id: row.company_id,
        client_name: row.client_name,
        status: row.status,
        total: parseFloat(row.total),
        tax: parseFloat(row.tax),
        subtotal: parseFloat(row.subtotal),
        valid_until: row.valid_until,
        issue_date: row.issue_date,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: {
          id: row.client_id,
          name: row.client_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Client inconnu',
          email: row.email || '',
          avatar_url: row.avatar_url || ''
        }
      })),
      total
    };
  }

  /**
   * Récupère un devis par ID (vérifie que l'entreprise correspond)
   */
  static async findById(id: string, companyId: string): Promise<Quote | null> {
    const result = await query(`
      SELECT 
        q.id,
        q.quote_number,
        q.client_id,
        q.company_id,
        q.status,
        q.total_ttc as total,
        q.total_vat as tax,
        q.subtotal_ht as subtotal,
        q.valid_until,
        q.created_at as issue_date,
        q.notes,
        q.created_at,
        q.updated_at,
        c.company_name as client_name,
        c.first_name,
        c.last_name,
        c.email,
        c.avatar_url
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1 AND q.company_id = $2
    `, [id, companyId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      quote_number: row.quote_number,
      client_id: row.client_id,
      company_id: row.company_id,
      client_name: row.client_name,
      status: row.status,
      total: parseFloat(row.total),
      tax: parseFloat(row.tax),
      subtotal: parseFloat(row.subtotal),
      valid_until: row.valid_until,
      issue_date: row.issue_date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client: {
        id: row.client_id,
        name: row.client_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Client inconnu',
        email: row.email || '',
        avatar_url: row.avatar_url || ''
      }
    };
  }

  /**
   * Crée un nouveau devis
   */
  static async create(data: CreateQuoteData): Promise<Quote> {
    const result = await query(`
      INSERT INTO quotes (
        quote_number, client_id, company_id, status, total_ttc, total_vat, subtotal_ht,
        valid_until, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.quote_number || `QUO-${Date.now()}`,
      data.client_id,
      data.company_id,
      data.status,
      data.total,
      data.tax,
      data.subtotal,
      data.valid_until,
      data.notes
    ]);

    return result.rows[0];
  }

  /**
   * Met à jour un devis
   */
  static async update(id: string, data: UpdateQuoteData, companyId: string): Promise<Quote | null> {
    const fields = [];
    const params = [];
    let paramCount = 0;

    // Mapper les noms de colonnes
    const columnMapping: { [key: string]: string } = {
      total: 'total_ttc',
      tax: 'total_vat',
      subtotal: 'subtotal_ht',
      issue_date: 'created_at'
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        const columnName = columnMapping[key] || key;
        fields.push(`${columnName} = $${paramCount}`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id, companyId);
    }

    paramCount++;
    fields.push(`updated_at = $${paramCount}`);
    params.push(new Date());

    paramCount++;
    params.push(id);
    paramCount++;
    params.push(companyId);

    const result = await query(`
      UPDATE quotes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount - 1} AND company_id = $${paramCount}
      RETURNING *
    `, params);

    return result.rows[0] || null;
  }

  /**
   * Supprime un devis
   */
  static async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(`
      DELETE FROM quotes 
      WHERE id = $1 AND company_id = $2
    `, [id, companyId]);

    return result.rowCount > 0;
  }

  /**
   * Met à jour le statut d'un devis
   */
  static async updateStatus(id: string, status: string, companyId: string): Promise<Quote | null> {
    const result = await query(`
      UPDATE quotes 
      SET status = $1, updated_at = $2
      WHERE id = $3 AND company_id = $4
      RETURNING *
    `, [status, new Date(), id, companyId]);

    return result.rows[0] || null;
  }

  /**
   * Récupère les statistiques des devis d'une entreprise
   */
  static async getStats(companyId: string): Promise<{
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    converted: number;
    totalValue: number;
    averageQuote: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
        COALESCE(SUM(CASE WHEN status = 'accepted' THEN total_ttc ELSE 0 END), 0) as total_value,
        COALESCE(AVG(total_ttc), 0) as average_quote
      FROM quotes 
      WHERE company_id = $1
    `, [companyId]);

    const stats = result.rows[0];
    return {
      total: parseInt(stats.total),
      draft: parseInt(stats.draft),
      sent: parseInt(stats.sent),
      accepted: parseInt(stats.accepted),
      rejected: parseInt(stats.rejected),
      expired: parseInt(stats.expired),
      converted: parseInt(stats.converted),
      totalValue: parseFloat(stats.total_value),
      averageQuote: parseFloat(stats.average_quote)
    };
  }

  /**
   * Récupère les éléments d'un devis
   */
  static async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    const result = await query(`
      SELECT * FROM quote_items 
      WHERE quote_id = $1 
      ORDER BY created_at ASC
    `, [quoteId]);

    return result.rows;
  }

  /**
   * Crée un élément de devis
   */
  static async createQuoteItem(data: CreateQuoteItemData): Promise<QuoteItem> {
    const result = await query(`
      INSERT INTO quote_items (
        quote_id, description, quantity, unit_price_ht, discount_percent, vat_number
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.quote_id,
      data.description,
      data.quantity,
      data.unit_price,
      data.discount_percent,
      data.vat_number
    ]);

    return result.rows[0];
  }

  /**
   * Supprime tous les éléments d'un devis
   */
  static async deleteQuoteItems(quoteId: string): Promise<void> {
    await query(`
      DELETE FROM quote_items 
      WHERE quote_id = $1
    `, [quoteId]);
  }

  /**
   * Génère un numéro de devis unique
   */
  static async generateQuoteNumber(companyId: string): Promise<string> {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM quotes 
      WHERE company_id = $1 AND DATE(created_at) = CURRENT_DATE
    `, [companyId]);

    const count = parseInt(result.rows[0].count) + 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `QUO-${year}${month}${day}-${String(count).padStart(3, '0')}`;
  }
}
