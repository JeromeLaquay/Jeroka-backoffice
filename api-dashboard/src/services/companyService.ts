import { 
  CompanyRepository, 
  Company, 
  CompanyFilters, 
  CompanySettings, 
  CompanyUser,
  CreateCompanyData,
  UpdateCompanyData
} from '../repositories/companyRepository';
import { CompanyValidation } from '../validations/companyValidation';

export class CompanyService {

  /**
   * Récupère une entreprise par son ID
   */
  static async getCompany(companyId: string): Promise<Company | null> {
    // Validation de l'ID entreprise
    const idValidation = CompanyValidation.validateCompanyId(companyId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }

    return await CompanyRepository.findById(companyId);
  }

  /**
   * Récupère toutes les entreprises avec filtres et pagination
   */
  static async getCompanies(filters: CompanyFilters): Promise<{ data: Company[], total: number, pagination?: any }> {
    // Validation des filtres
    const validation = CompanyValidation.validateFilters(filters);
    if (validation.error) {
      throw new Error(`Filtres invalides: ${validation.error}`);
    }

    const validatedFilters = validation.value!;
    const result = await CompanyRepository.findAll(validatedFilters);
    
    const pagination = validatedFilters.page && validatedFilters.limit ? {
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / validatedFilters.limit)
    } : undefined;

    return {
      data: result.data,
      total: result.total,
      pagination
    };
  }

  /**
   * Crée une nouvelle entreprise
   */
  static async createCompany(companyData: CreateCompanyData): Promise<Company> {
    // Validation des données avec règles métier
    const validation = CompanyValidation.validateCreateWithBusinessRules(companyData);
    if (validation.error) {
      throw new Error(`Données invalides: ${validation.error}`);
    }

    const validatedData = validation.value!;
    return await CompanyRepository.create(validatedData);
  }

  /**
   * Met à jour une entreprise
   */
  static async updateCompany(companyId: string, companyData: UpdateCompanyData): Promise<Company | null> {
    // Validation de l'ID entreprise
    const idValidation = CompanyValidation.validateCompanyId(companyId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }

    // Validation des données avec règles métier
    const validation = CompanyValidation.validateUpdateWithBusinessRules(companyData);
    if (validation.error) {
      throw new Error(`Données invalides: ${validation.error}`);
    }

    const validatedData = validation.value!;
    return await CompanyRepository.update(companyId, validatedData);
  }

  /**
   * Supprime une entreprise
   */
  static async deleteCompany(companyId: string): Promise<boolean> {
    return await CompanyRepository.delete(companyId);
  }

  /**
   * Bascule le statut actif/inactif d'une entreprise
   */
  static async toggleCompanyStatus(companyId: string): Promise<Company | null> {
    return await CompanyRepository.toggleStatus(companyId);
  }

  /**
   * Récupère les paramètres d'une entreprise
   */
  static async getCompanySettings(companyId: string): Promise<CompanySettings | null> {
    return await CompanyRepository.getSettings(companyId);
  }

  /**
   * Met à jour les paramètres d'une entreprise
   */
  static async updateCompanySettings(companyId: string, settings: Partial<CompanySettings>): Promise<CompanySettings | null> {
    return await CompanyRepository.updateSettings(companyId, settings);
  }

  /**
   * Supprime les paramètres d'une entreprise
   */
  static async deleteCompanySettings(companyId: string): Promise<boolean> {
    return await CompanyRepository.deleteSettings(companyId);
  }

  /**
   * Récupère les utilisateurs d'une entreprise
   */
  static async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    return await CompanyRepository.getUsers(companyId);
  }

  /**
   * Vérifie si une entreprise existe
   */
  static async companyExists(companyId: string): Promise<boolean> {
    return await CompanyRepository.exists(companyId);
  }

  /**
   * Récupère les statistiques d'une entreprise
   */
  static async getCompanyStats(companyId: string): Promise<{
    user_count: number;
    invoice_count: number;
    quote_count: number;
    client_count: number;
  }> {
    return await CompanyRepository.getStats(companyId);
  }
}

export default CompanyService;