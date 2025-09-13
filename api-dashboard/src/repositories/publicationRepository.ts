import { query } from '../database/connection';

export type PublicationStatus = 'draft' | 'scheduled' | 'published';
export type PublicationType = 'standard' | 'promotion' | 'event' | 'announcement' | 'tutorial';

export interface Publication {
  id: string;
  company_id: string;
  title: string;
  content: string;
  hashtags?: string | null;
  image?: string | null;
  image_url?: string | null;
  platforms: string[];
  type: PublicationType;
  status: PublicationStatus;
  category?: string | null;
  keywords?: string | null;
  created_at: string;
  updated_at?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  author_id?: string | null;
  views?: number | null;
  likes?: number | null;
  shares?: number | null;
}

export interface PublicationFilters {
  search?: string;
  status?: PublicationStatus;
  platform?: string;
  category?: string;
  type?: PublicationType;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'published_at' | 'scheduled_at' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class PublicationRepository {
  static async findAll(companyId: string, filters: PublicationFilters) {
    const {
      search,
      status,
      platform,
      category,
      type,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    const where: string[] = ['company_id = $1'];
    const params: any[] = [companyId];
    let i = 2;

    if (search) {
      where.push(`(LOWER(title) LIKE LOWER($${i}) OR LOWER(content) LIKE LOWER($${i}))`);
      params.push(`%${search}%`); i++;
    }
    if (status) {
      where.push(`status = $${i}`);
      params.push(status); i++;
    }
    if (platform) {
      where.push(`$${i} = ANY(platforms)`);
      params.push(platform); i++;
    }
    if (category) {
      where.push(`category = $${i}`);
      params.push(category); i++;
    }
    if (type) {
      where.push(`type = $${i}`);
      params.push(type); i++;
    }

    const validSort = ['created_at', 'updated_at', 'published_at', 'scheduled_at', 'title', 'status'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const whereClause = where.join(' AND ');

    const countSql = `SELECT COUNT(*) AS total FROM publications WHERE ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);

    const dataSql = `
      SELECT * FROM publications
      WHERE ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);

    return {
      publications: dataResult.rows as Publication[],
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < total
    };
  }

  static async findById(companyId: string, id: string): Promise<Publication | null> {
    const result = await query('SELECT * FROM publications WHERE id = $1 AND company_id = $2', [id, companyId]);
    return result.rows[0] || null;
  }

  static async create(companyId: string, data: Omit<Publication, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'published_at'>) {
    const sql = `
      INSERT INTO publications (
        company_id, title, content, hashtags, image, image_url, platforms, type, status, category, keywords, scheduled_at, author_id, views, likes, shares
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, COALESCE($14, 0), COALESCE($15, 0), COALESCE($16, 0)
      ) RETURNING *
    `;
    const params = [
      companyId,
      data.title,
      data.content,
      data.hashtags ?? null,
      data.image ?? null,
      data.image_url ?? null,
      data.platforms,
      data.type,
      data.status,
      data.category ?? null,
      data.keywords ?? null,
      data.scheduled_at ?? null,
      data.author_id ?? null,
      data.views ?? 0,
      data.likes ?? 0,
      data.shares ?? 0
    ];
    const result = await query(sql, params);
    return result.rows[0] as Publication;
  }

  static async update(companyId: string, id: string, data: Partial<Publication>): Promise<Publication | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      return this.findById(companyId, id);
    }
    const setParts: string[] = [];
    const params: any[] = [];
    let i = 1;
    for (const field of fields) {
      setParts.push(`${field} = $${i}`);
      params.push((data as any)[field]);
      i++;
    }
    params.push(id);
    params.push(companyId);
    const sql = `
      UPDATE publications SET ${setParts.join(', ')}, updated_at = NOW()
      WHERE id = $${i} AND company_id = $${i + 1}
      RETURNING *
    `;
    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  static async remove(companyId: string, id: string): Promise<boolean> {
    const result = await query('DELETE FROM publications WHERE id = $1 AND company_id = $2', [id, companyId]);
    return result.rowCount > 0;
  }

  static async publish(companyId: string, id: string): Promise<Publication | null> {
    const result = await query(
      `UPDATE publications SET status = 'published', published_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND company_id = $2 RETURNING *`,
      [id, companyId]
    );
    return result.rows[0] || null;
  }
}

export default PublicationRepository;


