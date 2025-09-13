import { query } from '../database/connection';

export interface Message {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  prompt: string;
  response: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  source?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
  replied_at?: string | null;
}

export interface MessageFilters {
  search?: string;
  status?: 'new' | 'read' | 'replied' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  source?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'status' | 'subject';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export class MessageRepository {
  static async getMessages(
    companyId: string,
    filters: MessageFilters = {}
  ): Promise<PaginatedResult<Message>> {
    const {
      search,
      status,
      priority,
      source,
      tags,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters;

    const where: string[] = ['company_id = $1'];
    const params: any[] = [companyId];
    let i = 2;

    if (search && search.trim() !== '') {
      where.push(`(LOWER(first_name || ' ' || last_name) LIKE LOWER($${i}) OR LOWER(email) LIKE LOWER($${i}) OR LOWER(subject) LIKE LOWER($${i}) OR LOWER(message) LIKE LOWER($${i}))`);
      params.push(`%${search.trim()}%`);
      i++;
    }

    if (status) {
      where.push(`status = $${i}`);
      params.push(status);
      i++;
    }

    if (priority) {
      where.push(`priority = $${i}`);
      params.push(priority);
      i++;
    }

    if (source && source.trim() !== '') {
      where.push(`source = $${i}`);
      params.push(source.trim());
      i++;
    }

    if (tags && tags.length > 0) {
      where.push(`tags && $${i}`);
      params.push(JSON.stringify(tags));
      i++;
    }

    const validSort = ['created_at', 'updated_at', 'priority', 'status', 'subject'];
    const sortField = validSort.includes(sortBy || '') ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const whereClause = where.join(' AND ');
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total FROM messages WHERE ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);

    const dataSql = `
      SELECT *
      FROM messages
      WHERE ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);

    // Parser les tags JSON pour chaque message
    const parsedData = dataResult.rows.map((row: any) => ({
      ...row,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null
    }));

    return {
      data: parsedData,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    };
  }

  static async getStats(companyId: string): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'new') AS "new",
        COUNT(*) FILTER (WHERE status = 'read') AS read,
        COUNT(*) FILTER (WHERE status = 'replied') AS replied,
        COUNT(*) FILTER (WHERE status = 'archived') AS archived,
        COUNT(*) FILTER (WHERE created_at >= NOW()::date) AS "todayCount",
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS "weekCount",
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS "monthCount"
      FROM messages
      WHERE company_id = $1
    `;
    const result = await query(sql, [companyId]);
    return result.rows[0];
  }

  static async getById(id: string, companyId: string): Promise<Message | null> {
    const result = await query('SELECT * FROM messages WHERE id = $1 AND company_id = $2', [id, companyId]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null
      };
    }
    return null;
  }

  static async create(companyId: string, data: Omit<Message, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'read_at' | 'replied_at'>): Promise<{ id: string; created_at: string; }> {
    const sql = `
      INSERT INTO messages (
        company_id, first_name, last_name, email, phone, company, subject, message,
        status, priority, source, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at
    `;
    const params = [
      companyId,
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      data.company || null,
      data.subject,
      data.message,
      data.status || 'new',
      data.priority || 'medium',
      data.source || null,
      data.tags ? JSON.stringify(data.tags) : null
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  static async update(id: string, companyId: string, data: Partial<Message>): Promise<Message | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      return this.getById(id, companyId);
    }

    const setParts: string[] = [];
    const params: any[] = [];
    let i = 1;
    for (const field of fields) {
      setParts.push(`${field} = $${i}`);
      // Convertir les tags en JSON si c'est un tableau
      const value = (data as any)[field];
      if (field === 'tags' && Array.isArray(value)) {
        params.push(JSON.stringify(value));
      } else {
        params.push(value);
      }
      i++;
    }

    params.push(id);
    params.push(companyId);

    const sql = `
      UPDATE messages
      SET ${setParts.join(', ')}, updated_at = NOW()
      WHERE id = $${i} AND company_id = $${i + 1}
      RETURNING *
    `;
    const result = await query(sql, params);
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null
      };
    }
    return null;
  }

  static async markRead(id: string, companyId: string): Promise<Message | null> {
    const result = await query(
      `UPDATE messages SET status = 'read', read_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND company_id = $2 RETURNING *`,
      [id, companyId]
    );
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null
      };
    }
    return null;
  }

  static async markAllRead(companyId: string): Promise<{ updatedCount: number; }> {
    const result = await query(
      `UPDATE messages SET status = 'read', read_at = NOW(), updated_at = NOW()
       WHERE company_id = $1 AND status = 'new'`,
      [companyId]
    );
    return { updatedCount: result.rowCount || 0 };
  }

  static async remove(id: string, companyId: string): Promise<boolean> {
    const result = await query('DELETE FROM messages WHERE id = $1 AND company_id = $2', [id, companyId]);
    return result.rowCount > 0;
  }
}

export default MessageRepository;
