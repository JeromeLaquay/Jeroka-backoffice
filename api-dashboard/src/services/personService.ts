import { PersonRepository, Person, PersonFilters, PaginatedResult } from '../repositories/personRepository';
import { PersonValidation } from '../validations/personValidation';

export class personService {
  /**
   * Récupère tous les persons d'une entreprise
   */
  static async getpersons(companyId: string, filters: PersonFilters = {}): Promise<PaginatedResult<Person>> {
    console.log('getpersons', companyId, filters);
    // Validation de l'ID entreprise
    const companyValidation = PersonValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Validation des filtres
    const filtersValidation = PersonValidation.validateFilters(filters);
    if (filtersValidation.error) {
      throw new Error(filtersValidation.error);
    }

    return PersonRepository.getPersons(companyId, filtersValidation.value);
  }

  /**
   * Récupère un person par ID
   */
  static async getpersonById(personId: string, companyId: string): Promise<Person | null> {
    // Validation des IDs
    const personValidation = PersonValidation.validatepersonId(personId);
    if (personValidation.error) {
      throw new Error(personValidation.error);
    }

    const companyValidation = PersonValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    return PersonRepository.getPersonById(personId, companyId);
  }

  /**
   * Crée un nouveau person
   */
  static async createperson(personData: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person> {
    console.log('createperson', personData);
    // Validation avec règles métier
    const validation = PersonValidation.validateCreateWithBusinessRules(personData);
    if (validation.error) {
      throw new Error(validation.error);
    }

    // Vérifier l'unicité de l'email dans l'entreprise
    const existingperson = await PersonRepository.getPersonByEmail(personData.email, personData.company_id);
    if (existingperson) {
      throw new Error('Un person avec cet email existe déjà dans cette entreprise');
    }

    return PersonRepository.createPerson(validation.value);
  }

  /**
   * Met à jour un person
   */
  static async updateperson(
    personId: string, 
    companyId: string, 
    updateData: Partial<Omit<Person, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
  ): Promise<Person | null> {
    // Validation des IDs
    const personValidation = PersonValidation.validatepersonId(personId);
    if (personValidation.error) {
      throw new Error(personValidation.error);
    }

    const companyValidation = PersonValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Vérifier que le person existe
    const existingperson = await PersonRepository.getPersonById(personId, companyId);
    if (!existingperson) {
      throw new Error('person non trouvé');
    }

    // Validation des données de mise à jour
    const validation = PersonValidation.validateUpdateWithBusinessRules(updateData);
    if (validation.error) {
      throw new Error(validation.error);
    }

    // Vérifier l'unicité de l'email si modifié
    if (updateData.email && updateData.email !== existingperson.email) {
      const emailExists = await PersonRepository.getPersonByEmail(updateData.email, companyId);
      if (emailExists) {
        throw new Error('Un person avec cet email existe déjà dans cette entreprise');
      }
    }

    return PersonRepository.updatePerson(personId, companyId, validation.value);
  }

  /**
   * Supprime un person
   */
  static async deleteperson(personId: string, companyId: string): Promise<boolean> {
    // Validation des IDs
    const personValidation = PersonValidation.validatepersonId(personId);
    if (personValidation.error) {
      throw new Error(personValidation.error);
    }

    const companyValidation = PersonValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    // Vérifier que le person existe
    const existingperson = await PersonRepository.getPersonById(personId, companyId);
    if (!existingperson) {
      throw new Error('person non trouvé');
    }

    return PersonRepository.deletePerson(personId, companyId);
  }

  /**
   * Récupère les statistiques des persons
   */
  static async getpersonStats(companyId: string) {
    // Validation de l'ID entreprise
    const companyValidation = PersonValidation.validateCompanyId(companyId);
    if (companyValidation.error) {
      throw new Error(companyValidation.error);
    }

    return PersonRepository.getPersonStats(companyId);
  }

  static async getPersonByEmail(email: string, companyId: string): Promise<Person | null> {
    return PersonRepository.getPersonByEmail(email, companyId);
  }
}
export default personService;