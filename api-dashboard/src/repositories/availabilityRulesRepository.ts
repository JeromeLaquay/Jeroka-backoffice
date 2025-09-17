import { query } from '../database/connection';
import { AvailabilityRule } from '../types/availabilityRules';

export class AvailabilityRulesRepository {
  static async create(userId: string, day: string, startTime: string, endTime: string , googleEventId: string) {
    const result = await query(`
      INSERT INTO availability_rules (user_id, day, start_time, end_time, status, google_event_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, day, startTime, endTime, 'pending', googleEventId]);
    return result.rows[0];
  }

  static async createRules(slots: AvailabilityRule[]) {
    const results = [];
    for (const slot of slots) {
        const result = await query(`
        INSERT INTO availability_rules (user_id, day, start_time, end_time, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [slot.userId, slot.day, slot.startTime, slot.endTime, 'pending']);
        results.push(result.rows[0]);
    }
    return results;
  }
  static async findPendingWithoutAppointmentByUserId(userId: string) {
    const result = await query(`
      SELECT * FROM availability_rules WHERE user_id = $1 AND status = 'pending' AND id NOT IN (SELECT availability_rule_id FROM appointments)
    `, [userId]);
    return result.rows;
  }
}
export default AvailabilityRulesRepository;