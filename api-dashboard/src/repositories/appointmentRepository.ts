import { Appointment, AppointmentDTO } from '@/types/appointment';
import { query } from '../database/connection';
export class AppointmentRepository {
  static async findByUserId(userId: string, { startDate, endDate }: { startDate?: string, endDate?: string }) : Promise<AppointmentDTO[]> {
    const result = await query(`
      SELECT 
        a.*, 
        ar.user_id, 
        ar.day, 
        ar.start_time, 
        ar.end_time
      FROM appointments a
      JOIN availability_rules ar ON ar.id = a.availability_rule_id
      WHERE ar.user_id = $1
        AND ($2::date IS NULL OR ar.day >= $2::date)
        AND ($3::date IS NULL OR ar.day <= $3::date)
      ORDER BY ar.day, ar.start_time
    `, [userId, startDate ?? null, endDate ?? null]);
    return result.rows;
  }

  static async create(availabilityRuleId: string, { clientFirstName, clientLastName, clientEmail, clientPhone, notes }: { clientFirstName: string, clientLastName: string, clientEmail: string, clientPhone?: string, notes?: string }): Promise<Appointment> {
    const result = await query(`
      INSERT INTO appointments (availability_rule_id, client_first_name, client_last_name, client_email, client_phone, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [availabilityRuleId, clientFirstName, clientLastName, clientEmail, clientPhone ?? null, notes ?? null]);
    return result.rows[0];
  }
  static async delete(id: string) {
    const result = await query(`
      DELETE FROM appointments WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}
export default AppointmentRepository;