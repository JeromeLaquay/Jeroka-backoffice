import { query } from '../database/connection';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  tax: number;
  subtotal: number;
  due_date: Date;
  issue_date: Date;
  paid_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
  created_at: Date;
}

export interface CreateInvoiceData {
  invoice_number?: string;
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  tax: number;
  subtotal: number;
  due_date: Date;
  issue_date: Date;
  notes?: string;
}

export interface UpdateInvoiceData {
  client_id?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total?: number;
  tax?: number;
  subtotal?: number;
  due_date?: Date;
  paid_date?: Date;
  notes?: string;
  updated_at?: Date;
}

export interface CreateInvoiceItemData {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
}

export class InvoiceRepository {
  /**
   * Récupère toutes les factures d'une entreprise
   */
  static async findByCompanyId(companyId: string, filters?: {
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ invoices: Invoice[], total: number }> {
    let queryStr = `
      SELECT 
        i.id,
        i.invoice_number,
        i.client_id,
        i.company_id,
        i.status,
        i.total_ttc as total,
        i.total_vat as tax,
        i.subtotal_ht as subtotal,
        i.due_date,
        i.issue_date,
        i.paid_at as paid_date,
        i.notes,
        i.created_at,
        i.updated_at,
        c.company_name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.company_id = $1
    `;
    
    const params: any[] = [companyId];
    let paramCount = 1;

    if (filters?.status) {
      paramCount++;
      queryStr += ` AND i.status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters?.clientId) {
      paramCount++;
      queryStr += ` AND i.client_id = $${paramCount}`;
      params.push(filters.clientId);
    }

    if (filters?.dateFrom) {
      paramCount++;
      queryStr += ` AND i.issue_date >= $${paramCount}`;
      params.push(filters.dateFrom);
    }

    if (filters?.dateTo) {
      paramCount++;
      queryStr += ` AND i.issue_date <= $${paramCount}`;
      params.push(filters.dateTo);
    }

    queryStr += ` ORDER BY i.created_at DESC`;

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
      FROM invoices i
      WHERE i.company_id = $1
    `;
    const countParams: any[] = [companyId];
    let countParamCount = 1;

    if (filters?.status) {
      countParamCount++;
      countQuery += ` AND i.status = $${countParamCount}`;
      countParams.push(filters.status);
    }

    if (filters?.clientId) {
      countParamCount++;
      countQuery += ` AND i.client_id = $${countParamCount}`;
      countParams.push(filters.clientId);
    }

    if (filters?.dateFrom) {
      countParamCount++;
      countQuery += ` AND i.issue_date >= $${countParamCount}`;
      countParams.push(filters.dateFrom);
    }

    if (filters?.dateTo) {
      countParamCount++;
      countQuery += ` AND i.issue_date <= $${countParamCount}`;
      countParams.push(filters.dateTo);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return {
      invoices: result.rows,
      total
    };
  }

  /**
   * Récupère une facture par ID (vérifie que l'entreprise correspond)
   */
  static async findById(id: string, companyId: string): Promise<Invoice | null> {
    const result = await query(`
      SELECT 
        i.id,
        i.invoice_number,
        i.client_id,
        i.company_id,
        i.status,
        i.total_ttc as total,
        i.total_vat as tax,
        i.subtotal_ht as subtotal,
        i.due_date,
        i.issue_date,
        i.paid_at as paid_date,
        i.notes,
        i.created_at,
        i.updated_at,
        c.company_name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = $1 AND i.company_id = $2
    `, [id, companyId]);

    return result.rows[0] || null;
  }

  /**
   * Crée une nouvelle facture
   */
  static async create(data: CreateInvoiceData): Promise<Invoice> {
    const result = await query(`
      INSERT INTO invoices (
        invoice_number, client_id, company_id, status, total_ttc, total_vat, subtotal_ht,
        due_date, issue_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.invoice_number || `INV-${Date.now()}`,
      data.client_id,
      data.company_id,
      data.status,
      data.total,
      data.tax,
      data.subtotal,
      data.due_date,
      data.issue_date,
      data.notes
    ]);

    return result.rows[0];
  }

  /**
   * Met à jour une facture
   */
  static async update(id: string, data: UpdateInvoiceData, companyId: string): Promise<Invoice | null> {
    const fields = [];
    const params = [];
    let paramCount = 0;

    // Mapper les noms de colonnes
    const columnMapping: { [key: string]: string } = {
      total: 'total_ttc',
      tax: 'total_vat',
      subtotal: 'subtotal_ht',
      paid_date: 'paid_at'
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
      UPDATE invoices 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount - 1} AND company_id = $${paramCount}
      RETURNING *
    `, params);

    return result.rows[0] || null;
  }

  /**
   * Supprime une facture
   */
  static async delete(id: string, companyId: string): Promise<boolean> {
    const result = await query(`
      DELETE FROM invoices 
      WHERE id = $1 AND company_id = $2
    `, [id, companyId]);

    return result.rowCount > 0;
  }

  /**
   * Met à jour le statut d'une facture
   */
  static async updateStatus(id: string, status: string, companyId: string): Promise<Invoice | null> {
    const updateData: UpdateInvoiceData = {
      status: status as any,
      updated_at: new Date()
    };

    // Si le statut est 'paid', ajouter la date de paiement
    if (status === 'paid') {
      updateData.paid_date = new Date();
    }

    return await this.update(id, updateData, companyId);
  }

  /**
   * Récupère les statistiques des factures d'une entreprise
   */
  static async getStats(companyId: string): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalRevenue: number;
    averageInvoice: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_ttc ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(total_ttc), 0) as average_invoice
      FROM invoices 
      WHERE company_id = $1
    `, [companyId]);

    const stats = result.rows[0];
    return {
      total: parseInt(stats.total),
      draft: parseInt(stats.draft),
      sent: parseInt(stats.sent),
      paid: parseInt(stats.paid),
      overdue: parseInt(stats.overdue),
      cancelled: parseInt(stats.cancelled),
      totalRevenue: parseFloat(stats.total_revenue),
      averageInvoice: parseFloat(stats.average_invoice)
    };
  }

  /**
   * Récupère les éléments d'une facture
   */
  static async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const result = await query(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = $1 
      ORDER BY created_at ASC
    `, [invoiceId]);

    return result.rows;
  }

  /**
   * Crée un élément de facture
   */
  static async createInvoiceItem(data: CreateInvoiceItemData): Promise<InvoiceItem> {
    const result = await query(`
      INSERT INTO invoice_items (
        invoice_id, description, quantity, unit_price_ht, discount_percent, vat_number
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.invoice_id,
      data.description,
      data.quantity,
      data.unit_price,
      data.discount_percent,
      data.vat_number
    ]);

    return result.rows[0];
  }

  /**
   * Supprime tous les éléments d'une facture
   */
  static async deleteInvoiceItems(invoiceId: string): Promise<void> {
    await query(`
      DELETE FROM invoice_items 
      WHERE invoice_id = $1
    `, [invoiceId]);
  }

  /**
   * Génère un numéro de facture unique
   */
  static async generateInvoiceNumber(companyId: string): Promise<string> {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM invoices 
      WHERE company_id = $1 AND DATE(created_at) = CURRENT_DATE
    `, [companyId]);

    const count = parseInt(result.rows[0].count) + 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `INV-${year}${month}${day}-${String(count).padStart(3, '0')}`;
  }

  /**
   * Marque les factures en retard
   */
  static async markOverdueInvoices(companyId: string): Promise<number> {
    const result = await query(`
      UPDATE invoices 
      SET status = 'overdue', updated_at = $1
      WHERE company_id = $2 
        AND status = 'sent' 
        AND due_date < CURRENT_DATE
    `, [new Date(), companyId]);

    return result.rowCount;
  }
}
