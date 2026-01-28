import { apiService as api } from './api'

export interface AppointmentCreate {
  day: string
  startTime: string
  endTime: string,
  appointmentTime: number,
}

export interface Appointment {
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

// Availability Rules API
export const availabilityApi = {


  // Create new appointment
  create: async (appointment: Omit<AppointmentCreate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', appointment)
    return response.data || {} as Appointment
  }
}



// Appointments API
export const appointmentsApi = {
  // Get all appointments
  getAll: async (): Promise<Appointment[]> => {

    const response = await api.get<Appointment[]>('/appointments')
    return response.data || [] || []
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`)
    return response.data || {} as Appointment
  },

  // Create new appointment
  create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', appointment)
    return response.data || {} as Appointment
  },

  // Update appointment
  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, appointment)
    return response.data || {} as Appointment
  },

  // Delete appointment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`)
  }
}


// Export all APIs as a single object
export const calendarApi = {
  availability: availabilityApi,
  appointments: appointmentsApi,
}

export default calendarApi
