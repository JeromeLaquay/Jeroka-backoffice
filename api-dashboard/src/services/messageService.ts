import { MessageRepository, Message, MessageFilters, PaginatedResult } from '../repositories/messageRepository';
import { MessageValidation } from '../validations/messageValidation';
import { personService } from './personService';
import { Person } from '../repositories/personRepository';

export class MessageService {
  static async getMessages(companyId: string, filters: MessageFilters = {}): Promise<PaginatedResult<Message>> {
    const { error, value } = MessageValidation.validateFilters(filters);
    if (error) {
      throw new Error(error.message);
    }
    return MessageRepository.getMessages(companyId, value);
  }

  static async getStats(companyId: string) {
    return MessageRepository.getStats(companyId);
  }

  static async getById(id: string, companyId: string): Promise<Message | null> {
    return MessageRepository.getById(id, companyId);
  }

  static async create(companyId: string, data: any): Promise<{ id: string; created_at: string; }> {
      const { error, value } = MessageValidation.validateCreate(data);
      if (error) {
        throw new Error(error.message);
      }
      const clientData : Person = {
        company_id: companyId,
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        phone: value.phone,
        status: 'prospect' as const,
        type: 'individual' as const
      }
      const client = await personService.createPersonWithCheckUniqueEmail(clientData);
      return MessageRepository.create(companyId, value);
    }

  static async update(id: string, companyId: string, data: any): Promise<Message | null> {
    const { error, value } = MessageValidation.validateUpdate(data);
    if (error) {
      throw new Error(error.message);
    }
    return MessageRepository.update(id, companyId, value);
  }

  static async markRead(id: string, companyId: string): Promise<Message | null> {
    return MessageRepository.markRead(id, companyId);
  }

  static async markAllRead(companyId: string): Promise<{ updatedCount: number; }> {
    return MessageRepository.markAllRead(companyId);
  }

  static async remove(id: string, companyId: string): Promise<boolean> {
    return MessageRepository.remove(id, companyId);
  }
}