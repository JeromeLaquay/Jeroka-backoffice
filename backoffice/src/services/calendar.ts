import { apiService as api } from './api'

export interface AvailabilityRuleCreate {
  day: string
  startTime: string
  endTime: string,
  appointmentTime: number,
}

export interface Appointment {
  id: string
  day: string
  start_time: string
  end_time: string
  availability_rule_id: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone?: string
  notes?: string
  created_at: Date
  updated_at: Date
}

// Availability Rules API
export const availabilityApi = {


  // Create new availability rule
  create: async (rule: Omit<AvailabilityRuleCreate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityRuleCreate> => {
    const response = await api.post<AvailabilityRuleCreate>('/availability-rules', rule)
    return response.data || {} as AvailabilityRuleCreate
  }

}



// Appointments API
export const appointmentsApi = {
  // Get all appointments
  getAll: async (startDate?: string, endDate?: string): Promise<Appointment[]> => {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get<Appointment[]>('/appointments', { params })
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
