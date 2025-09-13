import { ClientRepository, Client, ClientFilters, PaginatedResult } from '../repositories/clientRepository';
import { ClientValidation } from '../validations/clientValidation';

export class ClientService {
  /**
   * Récupère tous les clients d'une entreprise
   */
  static async getClients(companyId: string, filters: ClientFilters = {}): Promise<PaginatedResult<Client>> {
    console.log('getClients', companyId, filters);
    // Validation de l'ID entreprise
    const companyValidation = ClientValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Validation des filtres
    const filtersValidation = ClientValidation.validateFilters(filters);
    if (filtersValidation.error) {
      throw new Error(filtersValidation.error);
    }

    return ClientRepository.getClients(companyId, filtersValidation.value);
  }

  /**
   * Récupère un client par ID
   */
  static async getClientById(clientId: string, companyId: string): Promise<Client | null> {
    // Validation des IDs
    const clientValidation = ClientValidation.validateClientId(clientId);
    if (clientValidation.error) {
      throw new Error(clientValidation.error);
    }

    const companyValidation = ClientValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    return ClientRepository.getClientById(clientId, companyId);
  }

  /**
   * Crée un nouveau client
   */
  static async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    console.log('createClient', clientData);
    // Validation avec règles métier
    const validation = ClientValidation.validateCreateWithBusinessRules(clientData);
    if (validation.error) {
      throw new Error(validation.error);
    }

    // Vérifier l'unicité de l'email dans l'entreprise
    const existingClient = await ClientRepository.getClientByEmail(clientData.email, clientData.company_id);
    if (existingClient) {
      throw new Error('Un client avec cet email existe déjà dans cette entreprise');
    }

    return ClientRepository.createClient(validation.value);
  }

  /**
   * Met à jour un client
   */
  static async updateClient(
    clientId: string, 
    companyId: string, 
    updateData: Partial<Omit<Client, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
  ): Promise<Client | null> {
    // Validation des IDs
    const clientValidation = ClientValidation.validateClientId(clientId);
    if (clientValidation.error) {
      throw new Error(clientValidation.error);
    }

    const companyValidation = ClientValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Vérifier que le client existe
    const existingClient = await ClientRepository.getClientById(clientId, companyId);
    if (!existingClient) {
      throw new Error('Client non trouvé');
    }

    // Validation des données de mise à jour
    const validation = ClientValidation.validateUpdateWithBusinessRules(updateData);
    if (validation.error) {
      throw new Error(validation.error);
    }

    // Vérifier l'unicité de l'email si modifié
    if (updateData.email && updateData.email !== existingClient.email) {
      const emailExists = await ClientRepository.getClientByEmail(updateData.email, companyId);
      if (emailExists) {
        throw new Error('Un client avec cet email existe déjà dans cette entreprise');
      }
    }

    return ClientRepository.updateClient(clientId, companyId, validation.value);
  }

  /**
   * Supprime un client
   */
  static async deleteClient(clientId: string, companyId: string): Promise<boolean> {
    // Validation des IDs
    const clientValidation = ClientValidation.validateClientId(clientId);
    if (clientValidation.error) {
      throw new Error(clientValidation.error);
    }

    const companyValidation = ClientValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Vérifier que le client existe
    const existingClient = await ClientRepository.getClientById(clientId, companyId);
    if (!existingClient) {
      throw new Error('Client non trouvé');
    }

    return ClientRepository.deleteClient(clientId, companyId);
  }

  /**
   * Récupère les statistiques des clients
   */
  static async getClientStats(companyId: string) {
    // Validation de l'ID entreprise
    const companyValidation = ClientValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    return ClientRepository.getClientStats(companyId);
  }
}