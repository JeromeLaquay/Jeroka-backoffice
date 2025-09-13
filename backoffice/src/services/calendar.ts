import { apiService as api } from './api'

// Types
export interface AvailabilityRule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  isBooked: boolean
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  date: string
  startTime: string
  endTime: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// API Response types
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Availability Rules API
export const availabilityApi = {
  // Get all availability rules
  getAll: async (): Promise<AvailabilityRule[]> => {
    const response = await api.get<AvailabilityRule[]>('/calendar/availability')
    return response.data || [] || []
  },

  // Create new availability rule
  create: async (rule: Omit<AvailabilityRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityRule> => {
    const response = await api.post<AvailabilityRule>('/calendar/availability', rule)
    return response.data || {} as AvailabilityRule
  },

  // Update availability rule
  update: async (id: string, rule: Partial<AvailabilityRule>): Promise<AvailabilityRule> => {
    const response = await api.put<AvailabilityRule>(`/calendar/availability/${id}`, rule)
    return response.data || {} as AvailabilityRule
  },

  // Delete availability rule
  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/availability/${id}`)
  }
}

// Time Slots API
export const timeSlotsApi = {
  // Get available time slots for a date range
  getAvailable: async (startDate: string, endDate: string): Promise<TimeSlot[]> => {
    const response = await api.get<TimeSlot[]>('/calendar/slots', {
      params: { startDate, endDate }
    })
    return response.data || [] || []
  },

  // Get available time slots for a specific date
  getAvailableForDate: async (date: string): Promise<TimeSlot[]> => {
    const response = await api.get<TimeSlot[]>('/calendar/slots', {
      params: { startDate: date, endDate: date }
    })
    return response.data || [] || []
  }
}

// Appointments API
export const appointmentsApi = {
  // Get all appointments
  getAll: async (startDate?: string, endDate?: string): Promise<Appointment[]> => {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get<Appointment[]>('/calendar/appointments', { params })
    return response.data || [] || []
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/calendar/appointments/${id}`)
    return response.data || {} as Appointment
  },

  // Create new appointment
  create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    const response = await api.post<Appointment>('/calendar/appointments', appointment)
    return response.data || {} as Appointment
  },

  // Update appointment
  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/calendar/appointments/${id}`, appointment)
    return response.data || {} as Appointment
  },

  // Delete appointment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/appointments/${id}`)
  }
}

// Google Calendar Integration API
export const googleCalendarApi = {
  // Sync with Google Calendar
  sync: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/calendar/google/sync')
    return response.data?.data || { success: false, message: 'Erreur de synchronisation' }
  },

  // Get sync status
  getSyncStatus: async (): Promise<{ lastSync: string; isConnected: boolean }> => {
    const response = await api.get<ApiResponse<{ lastSync: string; isConnected: boolean }>>('/calendar/google/status')
    return response.data?.data || { lastSync: '', isConnected: false }
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

  // Check if a time slot is available
  isSlotAvailable: (slot: TimeSlot): boolean => {
    return slot.isAvailable && !slot.isBooked
  },

  // Filter available slots
  filterAvailableSlots: (slots: TimeSlot[]): TimeSlot[] => {
    return slots.filter(slot => calendarUtils.isSlotAvailable(slot))
  },

  // Group slots by date
  groupSlotsByDate: (slots: TimeSlot[]): Record<string, TimeSlot[]> => {
    return slots.reduce((groups, slot) => {
      const date = slot.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(slot)
      return groups
    }, {} as Record<string, TimeSlot[]>)
  }
}

// Export all APIs as a single object
export const calendarApi = {
  availability: availabilityApi,
  timeSlots: timeSlotsApi,
  appointments: appointmentsApi,
  googleCalendar: googleCalendarApi,
  utils: calendarUtils
}

export default calendarApi
