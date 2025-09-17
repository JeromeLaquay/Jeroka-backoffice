import { apiService as api } from './api'

// Types
export interface AvailabilityRule {
  id: string
  user_id: string
  day: string
  start_time: string
  end_time: string
  status: string
  created_at: Date,
  google_event_id: string,
  updated_at: Date
}

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
  // Get all availability rules
  getAll: async (): Promise<AvailabilityRule[]> => {
    const response = await api.get<AvailabilityRule[]>('/availability-rules')
    return response.data || [] || []
  },

  // Create new availability rule
  create: async (rule: Omit<AvailabilityRuleCreate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityRule> => {
    const response = await api.post<AvailabilityRule>('/availability-rules', rule)
    return response.data || {} as AvailabilityRule
  },

  // Update availability rule
  update: async (id: string, rule: Partial<AvailabilityRule>): Promise<AvailabilityRule> => {
    const response = await api.put<AvailabilityRule>(`/availability-rules/${id}`, rule)
    return response.data || {} as AvailabilityRule
  },

  // Delete availability rule
  delete: async (id: string): Promise<void> => {
    await api.delete(`/availability-rules/${id}`)
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



// Utility functions
export const calendarUtils = {
  // Format time for display
  formatTime: (time: string): string => {
    return time.substring(0, 5) // Remove seconds if present
  },

  // Format date for display
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  // Get day name from day of week number
  getDayName: (dayOfWeek: number): string => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return days[dayOfWeek]
  },

  // Check if a date is today
  isToday: (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  },

  // Check if a date is in the past
  isPast: (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0]
    return date < today
  },

  // Generate time slots for a given time range
  generateTimeSlots: (startTime: string, endTime: string, duration: number = 30): string[] => {
    const slots: string[] = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    let current = new Date(start)
    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5)
      slots.push(timeString)
      current.setMinutes(current.getMinutes() + duration)
    }
    
    return slots
  },

}

// Export all APIs as a single object
export const calendarApi = {
  availability: availabilityApi,
  appointments: appointmentsApi,
  utils: calendarUtils
}

export default calendarApi
