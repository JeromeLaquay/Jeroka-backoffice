import { query } from '../database/connection';
import { Person } from './personRepository';
export class Appointment {
  id?: string;
  person_id?: string;
  user_id?: string;
  google_event_id?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class AppointmentCreate {
  user_id?: string;
  google_event_id?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
}

export class AppointmentToUpdate {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export class AppointmentClient {
  id?: string;
  person_id?: string;
  user_id?: string;
  google_event_id?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}
export class AppointmentRepository {
  static async getById(id: string) : Promise<Appointment> {
    const result = await query(`
      SELECT * FROM appointments WHERE id = $1
    `, [id]);
    return result.rows[0];
  }
  static async findByUserIdWithClient(userId: string) : Promise<AppointmentClient[]> {    
    const result = await query(`
      SELECT 
        a.*, 
        p.first_name,
        p.last_name,
        p.email,
        p.phone
      FROM appointments a
      LEFT JOIN persons p ON a.person_id = p.id
      WHERE a.user_id = $1
    `, [userId]);
    return result.rows;
  }

  static async create(userId: string, appointment: AppointmentCreate): Promise<Appointment> {
    const result = await query(`
      INSERT INTO appointments (user_id, google_event_id, start_time, end_time, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `, [appointment.user_id, appointment.google_event_id, appointment.start_time, appointment.end_time, appointment.status ?? null, null]);
    return result.rows[0];
  }

  static async delete(id: string) {
    const result = await query(`
      DELETE FROM appointments WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }

  static async update(userId: string, id: string, personId: string, status: string) {
    const result = await query(`
      UPDATE appointments SET person_id = $2, status = $3 WHERE id = $1 AND user_id = $4
      RETURNING *
    `, [id, personId, status ?? null, userId]);
    return result.rows[0];
  }
  static async updateStatus(id: string, status: string) {
    const result = await query(`
      UPDATE appointments SET status = $2 WHERE id = $1
      RETURNING *
    `, [id, status]);
    return result.rows[0];
  }

  static async updateConfirmed(userId: string, id: string, personId: string) {
    const result = await query(`
      UPDATE appointments SET person_id = $2, status = 'reserved' WHERE id = $1 AND user_id = $3
      RETURNING *
    `, [id, personId, userId]);
    return result.rows[0];
  }

  static async getByIdWithClient(id: string) : Promise<AppointmentClient> {
    const result = await query(`
      SELECT *  FROM appointments a JOIN persons p ON a.person_id = p.id WHERE a.id = $1
    `, [id]);
    return result.rows[0];
  }
}
export default AppointmentRepository;