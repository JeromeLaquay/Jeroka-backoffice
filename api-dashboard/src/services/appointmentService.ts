import { AppointmentRepository } from '../repositories/appointmentRepository';
import { Appointment, AppointmentDTO } from '../types/appointment';
export class AppointmentService {
  static async findByUserId(userId: string, { startDate, endDate }: { startDate?: string, endDate?: string }) : Promise<AppointmentDTO[]> {
    return AppointmentRepository.findByUserId(userId, { startDate, endDate });
  }
  static async create(availabilityRuleId: string, { clientFirstName, clientLastName, clientEmail, clientPhone, notes }: { clientFirstName: string, clientLastName: string, clientEmail: string, clientPhone?: string, notes?: string }) : Promise<Appointment> {
    return AppointmentRepository.create(availabilityRuleId, { clientFirstName, clientLastName, clientEmail, clientPhone, notes });
  }
  static async delete(id: string) {
    return AppointmentRepository.delete(id);
  }
}
export default AppointmentService;