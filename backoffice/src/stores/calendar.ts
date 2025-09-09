import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService as api } from '@/services/api'

// Types
interface AvailabilityRule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface TimeSlot {
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

interface Appointment {
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

export const useCalendarStore = defineStore('calendar', () => {
  // State
  const availabilityRules = ref<AvailabilityRule[]>([])
  const appointments = ref<Appointment[]>([])
  const timeSlots = ref<TimeSlot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeAvailabilityRules = computed(() => 
    availabilityRules.value.filter(rule => rule.isActive)
  )

  const upcomingAppointments = computed(() => 
    appointments.value.filter(appointment => 
      new Date(appointment.date) >= new Date()
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  )

  const availableTimeSlots = computed(() => 
    timeSlots.value.filter(slot => slot.isAvailable && !slot.isBooked)
  )

  // Actions - Availability Rules
  const fetchAvailabilityRules = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/calendar/availability')
      availabilityRules.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des règles de disponibilité'
      console.error('Erreur fetchAvailabilityRules:', err)
    } finally {
      loading.value = false
    }
  }

  const addAvailabilityRule = async (rule: Omit<AvailabilityRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/calendar/availability', rule)
      const newRule = response.data.data
      
      availabilityRules.value.push(newRule)
      return newRule
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout de la règle de disponibilité'
      console.error('Erreur addAvailabilityRule:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAvailabilityRule = async (rule: AvailabilityRule) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(`/calendar/availability/${rule.id}`, rule)
      const updatedRule = response.data.data
      
      const index = availabilityRules.value.findIndex(r => r.id === rule.id)
      if (index !== -1) {
        availabilityRules.value[index] = updatedRule
      }
      
      return updatedRule
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de la règle de disponibilité'
      console.error('Erreur updateAvailabilityRule:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAvailabilityRule = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      await api.delete(`/calendar/availability/${id}`)
      
      availabilityRules.value = availabilityRules.value.filter(rule => rule.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression de la règle de disponibilité'
      console.error('Erreur deleteAvailabilityRule:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Time Slots
  const fetchTimeSlots = async (startDate: string, endDate: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/calendar/slots', {
        params: { startDate, endDate }
      })
      
      timeSlots.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des créneaux'
      console.error('Erreur fetchTimeSlots:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Appointments
  const fetchAppointments = async (startDate?: string, endDate?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      
      const response = await api.get('/calendar/appointments', { params })
      appointments.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des rendez-vous'
      console.error('Erreur fetchAppointments:', err)
    } finally {
      loading.value = false
    }
  }

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/calendar/appointments', appointment)
      const newAppointment = response.data.data
      
      appointments.value.push(newAppointment)
      return newAppointment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la création du rendez-vous'
      console.error('Erreur createAppointment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAppointment = async (appointment: Appointment) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(`/calendar/appointments/${appointment.id}`, appointment)
      
      const index = appointments.value.findIndex(a => a.id === appointment.id)
      if (index !== -1) {
        appointments.value[index] = { ...appointments.value[index], ...appointment }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du rendez-vous'
      console.error('Erreur updateAppointment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      await api.delete(`/calendar/appointments/${id}`)
      
      appointments.value = appointments.value.filter(appointment => appointment.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression du rendez-vous'
      console.error('Erreur deleteAppointment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Google Calendar Integration
  const syncWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/calendar/google/sync')
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la synchronisation avec Google Calendar'
      console.error('Erreur syncWithGoogle:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  const getDayName = (dayOfWeek: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return days[dayOfWeek]
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // Remove seconds if present
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    availabilityRules,
    appointments,
    timeSlots,
    loading,
    error,
    
    // Computed
    activeAvailabilityRules,
    upcomingAppointments,
    availableTimeSlots,
    
    // Actions - Availability Rules
    fetchAvailabilityRules,
    addAvailabilityRule,
    updateAvailabilityRule,
    deleteAvailabilityRule,
    
    // Actions - Time Slots
    fetchTimeSlots,
    
    // Actions - Appointments
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Actions - Google Calendar
    syncWithGoogle,
    
    // Utility functions
    getDayName,
    formatTime,
    formatDate,
    clearError
  }
})
