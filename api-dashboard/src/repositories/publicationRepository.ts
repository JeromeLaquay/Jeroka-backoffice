import { query } from '../database/connection';

export type PublicationStatus = 'draft' | 'scheduled' | 'published';
export type PublicationType = 'standard' | 'promotion' | 'event' | 'announcement' | 'tutorial';

export interface Publication {
  id: string;
  company_id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  type: PublicationType;
  status: PublicationStatus;
  category?: string | null;
  tags?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  slug: string;
  view_count?: number | null;
  like_count?: number | null;
  share_count?: number | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  platforms?: string[] | null; // Ajouté pour la compatibilité frontend
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

    // Gestion de la recherche avec trim pour éviter les chaînes vides
    if (search && search.trim() !== '') {
      where.push(`(LOWER(title) LIKE LOWER($${i}) OR LOWER(content) LIKE LOWER($${i}))`);
      params.push(`%${search.trim()}%`); 
      i++;
    }
    
    if (status && status.trim() !== '') {
      where.push(`status = $${i}`);
      params.push(status); 
      i++;
    }
    
    if (platform && platform.trim() !== '') {
      where.push(`id IN (SELECT publication_id FROM publication_platforms WHERE platform = $${i})`);
      params.push(platform); 
      i++;
    }
    
    if (category && category.trim() !== '') {
      where.push(`category = $${i}`);
      params.push(category); 
      i++;
    }
    
    if (type && type.trim() !== '') {
      where.push(`type = $${i}`);
      params.push(type); 
      i++;
    }

    const validSort = ['created_at', 'updated_at', 'published_at', 'scheduled_at', 'title', 'status'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const whereClause = where.join(' AND ');

    // Compter le total
    const countSql = `SELECT COUNT(*) AS total FROM publications WHERE ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);

    // Récupérer les données avec pagination
    const dataSql = `
      SELECT 
        p.id, p.company_id, p.title, p.content, p.excerpt, p.featured_image, p.images, 
        p.hashtags, p.type, p.status, p.category, p.tags, p.seo_title, p.seo_description, 
        p.seo_keywords, p.slug, p.view_count, p.like_count, p.share_count,
        p.created_at, p.updated_at, p.scheduled_at, p.published_at,
        COALESCE(
          ARRAY_AGG(pp.platform) FILTER (WHERE pp.platform IS NOT NULL), 
          ARRAY[]::text[]
        ) as platforms
      FROM publications p
      LEFT JOIN publication_platforms pp ON p.id = pp.publication_id
      WHERE ${whereClause}
      GROUP BY p.id, p.company_id, p.title, p.content, p.excerpt, p.featured_image, p.images, 
               p.hashtags, p.type, p.status, p.category, p.tags, p.seo_title, p.seo_description, 
               p.seo_keywords, p.slug, p.view_count, p.like_count, p.share_count,
               p.created_at, p.updated_at, p.scheduled_at, p.published_at
      ORDER BY p.${sortField} ${order}
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const dataParams = [...params, limit, offset];
    const dataResult = await query(dataSql, dataParams);

    // Transformer les données pour s'assurer que les arrays sont correctement formatés
    const publications = dataResult.rows.map((row: any) => ({
      ...row,
      images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
      hashtags: Array.isArray(row.hashtags) ? row.hashtags : (row.hashtags ? [row.hashtags] : []),
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
      seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : (row.seo_keywords ? [row.seo_keywords] : []),
      platforms: Array.isArray(row.platforms) ? row.platforms : (row.platforms ? [row.platforms] : [])
    }));

    return {
      publications: publications as Publication[],
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: offset + limit < total
    };
  }

  static async findById(companyId: string, id: string): Promise<Publication | null> {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          ARRAY_AGG(pp.platform) FILTER (WHERE pp.platform IS NOT NULL), 
          ARRAY[]::text[]
        ) as platforms
      FROM publications p
      LEFT JOIN publication_platforms pp ON p.id = pp.publication_id
      WHERE p.id = $1 AND p.company_id = $2
      GROUP BY p.id
    `, [id, companyId]);
    
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : (row.hashtags ? [row.hashtags] : []),
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
        seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : (row.seo_keywords ? [row.seo_keywords] : []),
        platforms: Array.isArray(row.platforms) ? row.platforms : (row.platforms ? [row.platforms] : [])
      } as Publication;
    }
    return null;
  }

  static async create(companyId: string, data: Omit<Publication, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'published_at'>) {
    // Générer un slug unique basé sur le titre
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    const sql = `
      INSERT INTO publications (
        company_id, title, content, excerpt, featured_image, images, hashtags, 
        type, status, category, tags, seo_title, seo_description, seo_keywords, 
        slug, view_count, like_count, share_count, scheduled_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
        COALESCE($16, 0), COALESCE($17, 0), COALESCE($18, 0), $19
      ) RETURNING *
    `;
    const params = [
      companyId,
      data.title,
      data.content,
      data.excerpt ?? null,
      data.featured_image ?? null,
      data.images ?? [],
      data.hashtags ?? [],
      data.type,
      data.status,
      data.category ?? null,
      data.tags ?? [],
      data.seo_title ?? null,
      data.seo_description ?? null,
      data.seo_keywords ?? [],
      slug,
      data.view_count ?? 0,
      data.like_count ?? 0,
      data.share_count ?? 0,
      data.scheduled_at ?? null
    ];
    const result = await query(sql, params);
    const row = result.rows[0];
    
    // Ajouter les plateformes si elles existent
    if (data.platforms && data.platforms.length > 0) {
      await this.addPlatforms(row.id, data.platforms);
    }
    
    return {
      ...row,
      images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
      hashtags: Array.isArray(row.hashtags) ? row.hashtags : (row.hashtags ? [row.hashtags] : []),
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
      seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : (row.seo_keywords ? [row.seo_keywords] : []),
      platforms: data.platforms || []
    } as Publication;
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
      // Gérer la sérialisation JSON pour les arrays
      if (['images', 'hashtags', 'tags', 'seo_keywords'].includes(field) && Array.isArray((data as any)[field])) {
        params.push((data as any)[field]);
      } else {
        params.push((data as any)[field]);
      }
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
    
    if (result.rows[0]) {
      const row = result.rows[0];
      
      // Mettre à jour les plateformes si elles sont fournies
      if (data.platforms !== undefined && data.platforms !== null) {
        await this.updatePlatforms(id, data.platforms);
      }
      
      return {
        ...row,
        images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : (row.hashtags ? [row.hashtags] : []),
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
        seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : (row.seo_keywords ? [row.seo_keywords] : []),
        platforms: data.platforms || []
      } as Publication;
    }
    return null;
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
    
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : (row.hashtags ? [row.hashtags] : []),
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []),
        seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : (row.seo_keywords ? [row.seo_keywords] : []),
        platforms: [] // Sera récupéré par findById si nécessaire
      } as Publication;
    }
    return null;
  }

  // Méthodes pour gérer les plateformes
  static async addPlatforms(publicationId: string, platforms: string[]): Promise<void> {
    for (const platform of platforms) {
      await query(
        'INSERT INTO publication_platforms (publication_id, platform) VALUES ($1, $2) ON CONFLICT (publication_id, platform) DO NOTHING',
        [publicationId, platform]
      );
    }
  }

  static async updatePlatforms(publicationId: string, platforms: string[]): Promise<void> {
    // Supprimer toutes les plateformes existantes
    await query('DELETE FROM publication_platforms WHERE publication_id = $1', [publicationId]);
    
    // Ajouter les nouvelles plateformes
    if (platforms.length > 0) {
      await this.addPlatforms(publicationId, platforms);
    }
  }

  static async getPlatforms(publicationId: string): Promise<string[]> {
    const result = await query('SELECT platform FROM publication_platforms WHERE publication_id = $1', [publicationId]);
    return result.rows.map((row: any) => row.platform);
  }
}

export default PublicationRepository;


