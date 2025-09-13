import pool from '../database/connection';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CompanyFilters {
  search?: string;
  status?: string;
  type?: string;
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

export class CompanyService {

  static async getCompany(companyId: string): Promise<Company> {
    const company = await pool.query('SELECT * FROM companies WHERE id = $1', [companyId]);
    return company;
  }

  static async getCompanies(filters: CompanyFilters): Promise<Company[]> {
    const companies = await pool.query('SELECT * FROM companies WHERE $1', [filters]);
    return companies;
  }

  static async createCompany(company: Company): Promise<Company> {
    return await pool.query('INSERT INTO companies (name, email, phone) VALUES ($1, $2, $3) RETURNING *', [company.name, company.email, company.phone]);
  }

  static async updateCompany(companyId: string, company: Company): Promise<Company> {
    return await pool.query('UPDATE companies SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *', [company.name, company.email, company.phone, companyId]);
  }

  static async deleteCompany(companyId: string): Promise<boolean> {
    const company = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [companyId]);
    return company;
  }

  static async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const companySettings = await pool.query('SELECT * FROM company_settings WHERE company_id = $1', [companyId]);
    return companySettings;
  }

  static async updateCompanySettings(companyId: string, companySettings: CompanySettings): Promise<CompanySettings> {
    return await pool.query('UPDATE company_settings SET name = $1, email = $2, phone = $3 WHERE company_id = $4 RETURNING *', [companySettings.name, companySettings.email, companySettings.phone, companyId]);
    return companySettings;
  }

  static async deleteCompanySettings(companyId: string): Promise<boolean> {
    return await pool.query('DELETE FROM company_settings WHERE company_id = $1 RETURNING *', [companyId]);
  }

  static async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    const companyUsers = await pool.query('SELECT * FROM company_users WHERE company_id = $1', [companyId]);
    return companyUsers;
  }

}