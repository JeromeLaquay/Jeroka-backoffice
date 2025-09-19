import UserRepository from '../repositories/userRepository';
import { query } from '../database/connection';
import { AdminStats, AdminUser, AdminCompany, CreateUserData, UpdateUserData, CreateCompanyData, UpdateCompanyData } from '../types/admin';
import { UserService } from './userService';

export class AdminService {
    // Statistiques
    static async getStats(userId: string): Promise<AdminStats> {
        this.isAdmin(userId);
        const [companiesResult, usersResult, activeCompaniesResult, activeUsersResult] = await Promise.all([
            query('SELECT COUNT(*) as total FROM companies'),
            query('SELECT COUNT(*) as total FROM users'),
            query('SELECT COUNT(*) as total FROM companies WHERE status = \'active\''),
            UserRepository.countActive()
        ]);

        const [newCompaniesResult, newUsersResult] = await Promise.all([
            query('SELECT COUNT(*) as total FROM companies WHERE created_at >= DATE_TRUNC(\'month\', CURRENT_DATE)'),
            UserRepository.countNewThisMonth()
        ]);

        const subscriptionResult = await query(`
            SELECT 
                subscription_plan,
                COUNT(*) as count
            FROM companies 
            WHERE subscription_plan IS NOT NULL
            GROUP BY subscription_plan
        `);

        const subscriptionStats = {
            free: 0,
            basic: 0,
            premium: 0,
            enterprise: 0
        };

        subscriptionResult.rows.forEach((row: any) => {
            if (subscriptionStats.hasOwnProperty(row.subscription_plan)) {
                subscriptionStats[row.subscription_plan as keyof typeof subscriptionStats] = parseInt(row.count);
            }
        });

        return {
            total_companies: parseInt(companiesResult.rows[0].total),
            active_companies: parseInt(activeCompaniesResult.rows[0].total),
            total_users: parseInt(usersResult.rows[0].total),
            active_users: activeUsersResult,
            new_companies_this_month: parseInt(newCompaniesResult.rows[0].total),
            new_users_this_month: newUsersResult,
            subscription_stats: subscriptionStats
        };
    }

    // Gestion des utilisateurs
    static async getUsers(userId: string, filters?: any): Promise<{ data: AdminUser[], pagination?: any }> {
        this.isAdmin(userId);
        let queryStr = `
            SELECT 
                u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, 
                u.created_at, u.updated_at, u.last_login,
                c.name as company_name
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
        `;
        
        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (filters?.search) {
            paramCount++;
            conditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
            params.push(`%${filters.search}%`);
        }

        if (filters?.status) {
            paramCount++;
            conditions.push(`u.is_active = $${paramCount}`);
            params.push(filters.status === 'active');
        }

        if (filters?.role) {
            paramCount++;
            conditions.push(`u.role = $${paramCount}`);
            params.push(filters.role);
        }

        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }

        queryStr += ' ORDER BY u.created_at DESC';

        if (filters?.limit) {
            paramCount++;
            queryStr += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        if (filters?.page && filters?.limit) {
            paramCount++;
            queryStr += ` OFFSET $${paramCount}`;
            params.push((filters.page - 1) * filters.limit);
        }

        const result = await query(queryStr, params);
        return { data: result.rows };
    }

    static async getUser(userId: string, id: string): Promise<AdminUser | null> {
        this.isAdmin(userId);
        return UserRepository.findById(id);
    }

    static async createUser(userId: string, userData: CreateUserData): Promise<AdminUser> {
        this.isAdmin(userId);
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const userToCreate = {
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            password_hash: hashedPassword,
            role: userData.role,
            company_id: userData.company_id,
            telephone: userData.telephone || undefined,
            is_active: true,
            email_verified: true
        };
        
        return UserRepository.create(userToCreate);
    }

    static async updateUser(userId: string, id: string, userData: UpdateUserData): Promise<AdminUser | null> {
        this.isAdmin(userId);
        return UserRepository.update(id, userData);
    }

    static async toggleUserStatus(userId: string, id: string): Promise<AdminUser | null> {
        this.isAdmin(userId);
        return UserRepository.toggleStatus(id);
    }

    // Gestion des entreprises
    static async getCompanies(userId: string, filters?: any): Promise<{ data: AdminCompany[], pagination?: any }> {
        this.isAdmin(userId);
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

        if (filters?.search) {
            paramCount++;
            conditions.push(`(c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`);
            params.push(`%${filters.search}%`);
        }

        if (filters?.status) {
            paramCount++;
            conditions.push(`c.status = $${paramCount}`);
            params.push(filters.status);
        }

        if (filters?.subscription_plan) {
            paramCount++;
            conditions.push(`c.subscription_plan = $${paramCount}`);
            params.push(filters.subscription_plan);
        }

        if (conditions.length > 0) {
            queryStr += ' WHERE ' + conditions.join(' AND ');
        }

        queryStr += ' GROUP BY c.id ORDER BY c.created_at DESC';

        if (filters?.limit) {
            paramCount++;
            queryStr += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        if (filters?.page && filters?.limit) {
            paramCount++;
            queryStr += ` OFFSET $${paramCount}`;
            params.push((filters.page - 1) * filters.limit);
        }

        const result = await query(queryStr, params);
        return { data: result.rows };
    }

    static async getCompany(userId: string, id: string): Promise<AdminCompany | null> {
        this.isAdmin(userId);
        const result = await query(`
            SELECT 
                c.*,
                COUNT(u.id) as user_count
            FROM companies c
            LEFT JOIN users u ON c.id = u.company_id
            WHERE c.id = $1
            GROUP BY c.id
        `, [id]);
        
        return result.rows[0] || null;
    }

    static async createCompany(userId: string, companyData: CreateCompanyData): Promise<AdminCompany> {
        this.isAdmin(userId);
        console.log(companyData);
        const result = await query(`
            INSERT INTO companies (name, email, phone, address_line1, address_line2, city, postal_code, country, vat_number, siret, subscription_plan)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            companyData.subscription_plan || 'free'
        ]);
        console.log(result.rows[0]);
        return result.rows[0];
    }

    static async updateCompany(userId: string, id: string, companyData: UpdateCompanyData): Promise<AdminCompany | null> {
        this.isAdmin(userId);
        const fields = [];
        const params = [];
        let paramCount = 0;

        Object.entries(companyData).forEach(([key, value]) => {
            if (value !== undefined) {
                paramCount++;
                fields.push(`${key} = $${paramCount}`);
                params.push(value);
            }
        });

        if (fields.length === 0) {
            return this.getCompany(userId, id);
        }

        paramCount++;
        fields.push(`updated_at = NOW()`);
        params.push(id);

        const result = await query(`
            UPDATE companies 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, params);
        
        return result.rows[0] || null;
    }

    static async toggleCompanyStatus(userId: string, id: string): Promise<AdminCompany | null> {
        this.isAdmin(userId);
        const result = await query(`
            UPDATE companies 
            SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);
        
        return result.rows[0] || null;
    }

    static async isAdmin(userId: string) {
        if(!await UserService.isAdmin(userId)) {
            throw new Error('User is not admin');
        }
    }
}

export default AdminService;