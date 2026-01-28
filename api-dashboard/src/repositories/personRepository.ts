import { query } from '../database/connection';

export class Person {
  id?: string;
  company_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  siret?: string;
  vat_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'lead';
  type?: 'client' | 'supplier';
  type_client?: 'individual' | 'company';
  source?: string;
  tags?: string[];
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class PersonFilters {
  search?: string;
  status?: string;
  type?: string;
  source?: string;
  tags?: string[];
  sortBy?: string;
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

export class PersonRepository {
  /**
   * Récupère tous les Persons d'une entreprise avec filtres et pagination
   */
  static async getPersons(companyId: string, filters: PersonFilters = {}): Promise<PaginatedResult<Person>> {
    const {
      search,
      status,
      type,
      source,
      tags,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filters;

    // Construction des conditions WHERE
    const { whereClause, queryParams } = this.buildWhereClause(companyId, {
      search,
      status,
      type,
      source,
      tags
    });

    // Validation du tri
    const { sortField, order } = this.validateSorting(sortBy, sortOrder);

    // Calcul de l'offset
    const offset = (page - 1) * limit;

    // Requête de comptage
    const countQuery = `SELECT COUNT(*) as total FROM persons WHERE ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Requête des données
    const dataQuery = `
      SELECT * FROM persons 
      WHERE ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    const dataParams = [...queryParams, limit, offset];
    const dataResult = await query(dataQuery, dataParams);

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages,
      currentPage: page,
      limit
    };
  }

  static async getPersonByEmail(companyId: string, email: string): Promise<Person | null> {
    const result = await query(
      'SELECT * FROM persons WHERE email = $1 AND company_id = $2',
      [email, companyId]
    );
    return result.rows[0] || null;
  }

  static async getPersonBySiretOrNameOrEmailAndType(companyId: string, siret: string, firstName: string, lastName: string, email: string, type: 'client' | 'supplier'): Promise<Person | null> {
    const result = await query(
      'SELECT * FROM persons WHERE (siret = $1 OR (first_name LIKE $2 AND last_name LIKE $3) OR email LIKE $4) AND company_id = $5 AND type = $6',
      [siret, firstName, lastName, email, companyId, type]
    );
    return result.rows[0] || null;
  }

  /**
   * Récupère un person par ID
   */
  static async getPersonById(personId: string, companyId: string): Promise<Person | null> {
    const result = await query(
      'SELECT * FROM persons WHERE id = $1 AND company_id = $2',
      [personId, companyId]
    );
    return result.rows[0] || null;
  }

  /**
   * Crée un nouveau person
   */
  static async createPerson(personData: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person> {
    const result = await query(
      `INSERT INTO persons (
        company_id, first_name, last_name, email, phone, company_name,
        address_line1, address_line2, city, postal_code, country, status, type, type_client, source, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        personData.company_id,
        personData.first_name,
        personData.last_name,
        personData.email,
        personData.phone,
        personData.company_name,
        personData.address_line1,
        personData.address_line2,
        personData.city,
        personData.postal_code,
        personData.country,
        personData.status,
        personData.type,
        personData.type_client,
        personData.source,
        personData.tags,
        personData.notes
      ]
    );
    return result.rows[0];
  }

  /**
   * Met à jour un person
   */
  static async updatePerson(
    personId: string, 
    companyId: string, 
    updateData: Partial<Omit<Person, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
  ): Promise<Person | null> {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return this.getPersonById(personId, companyId);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    
    const result = await query(
      `UPDATE persons 
       SET ${setClause}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [personId, companyId, ...values]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Supprime un person
   */
  static async deletePerson(personId: string, companyId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM persons WHERE id = $1 AND company_id = $2',
      [personId, companyId]
    );
    return result.rowCount > 0;
  }

  /**
   * créer une vue sql pour les statistiques des persons et l'appeler dans la route directement
   */
  static async getPersonStats(companyId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    prospects: number;
    leads: number;
    individuals: number;
    companies: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE status = 'prospect') as prospects,
        COUNT(*) FILTER (WHERE status = 'lead') as leads,
        COUNT(*) FILTER (WHERE type = 'client') as individuals,
        COUNT(*) FILTER (WHERE type = 'supplier') as companies
      FROM persons 
      WHERE company_id = $1`,
      [companyId]
    );
    
    return result.rows[0];
  }

  /**
   * Construit la clause WHERE avec les filtres
   */
  private static buildWhereClause(
    companyId: string, 
    filters: Pick<PersonFilters, 'search' | 'status' | 'type' | 'source' | 'tags'>
  ): { whereClause: string; queryParams: any[] } {
    let whereConditions = ['company_id = $1'];
    let queryParams: any[] = [companyId];
    let paramIndex = 2;

    // Filtrage par recherche
    if (filters.search) {
      whereConditions.push(`(
        LOWER(first_name || ' ' || last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex}) OR
        LOWER(company_name) LIKE LOWER($${paramIndex}) OR
        phone LIKE $${paramIndex}
      )`);
      queryParams.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Filtrage par statut
    if (filters.status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    // Filtrage par type
    if (filters.type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(filters.type);
      paramIndex++;
    }

    // Filtrage par source
    if (filters.source) {
      whereConditions.push(`source = $${paramIndex}`);
      queryParams.push(filters.source);
      paramIndex++;
    }

    // Filtrage par tags
    if (filters.tags && filters.tags.length > 0) {
      whereConditions.push(`tags && $${paramIndex}`);
      queryParams.push(filters.tags);
      paramIndex++;
    }

    return {
      whereClause: whereConditions.join(' AND '),
      queryParams
    };
  }

  /**
   * Valide et normalise les paramètres de tri
   */
  private static validateSorting(sortBy: string, sortOrder: string): { sortField: string; order: string } {
    const validSortFields = ['created_at', 'updated_at', 'first_name', 'last_name', 'email', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    return { sortField, order };
  }
  
}

export default PersonRepository;