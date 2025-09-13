import { PublicationRepository, Publication, PublicationFilters } from '../repositories/publicationRepository';
import { PublicationValidation } from '../validations/publicationValidation';

export class PublicationService {
  static async list(companyId: string, filters: PublicationFilters) {
    const { error, value } = PublicationValidation.validateFilters(filters);
    if (error) throw new Error(error.message);
    return PublicationRepository.findAll(companyId, value);
  }

  static async getById(companyId: string, id: string): Promise<Publication | null> {
    return PublicationRepository.findById(companyId, id);
  }

  static async create(companyId: string, data: any) {
    const { error, value } = PublicationValidation.validateCreate(data);
    if (error) throw new Error(error.message);
    return PublicationRepository.create(companyId, value);
  }

  static async update(companyId: string, id: string, data: any) {
    const { error, value } = PublicationValidation.validateUpdate(data);
    if (error) throw new Error(error.message);
    return PublicationRepository.update(companyId, id, value);
  }

  static async remove(companyId: string, id: string) {
    return PublicationRepository.remove(companyId, id);
  }

  static async publish(companyId: string, id: string) {
    return PublicationRepository.publish(companyId, id);
  }
}

export default PublicationService;


