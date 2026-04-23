import { apiService as api } from './api'

export interface AppointmentCreate {
  day: string
  startTime: string
  endTime: string
  appointmentTime: number
}

export interface Appointment {
  id?: string
  person_id?: string
  user_id?: string
  google_event_id?: string
  status?: string
  start_time?: string
  end_time?: string
  notes?: string
  created_at?: Date
  updated_at?: Date
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

/** Normalise une réponse API (camelCase) vers le modèle utilisé par les vues (snake_case). */
function fromApiAppointment(raw: Record<string, unknown> | null | undefined): Appointment {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, any>
  return {
    id: r.id,
    person_id: r.personId ?? r.person_id,
    user_id: r.userId ?? r.user_id,
    google_event_id: r.googleEventId ?? r.google_event_id,
    status: r.status,
    start_time: r.startTime ?? r.start_time,
    end_time: r.endTime ?? r.end_time,
    notes: r.notes,
    created_at: r.createdAt ?? r.created_at,
    updated_at: r.updatedAt ?? r.updated_at,
    first_name: r.firstName ?? r.first_name,
    last_name: r.lastName ?? r.last_name,
    email: r.email,
    phone: r.phone,
  }
}

function unwrapList(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[]
  if (body && typeof body === 'object' && Array.isArray((body as any).items)) {
    return (body as any).items as Record<string, unknown>[]
  }
  return []
}

function combineLocalDateAndTime(day: string, time: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
}

const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const body = await api.get<unknown>('/appointments', { params: { page: 1, limit: 500 } })
    return unwrapList(body).map(fromApiAppointment)
  },

  getById: async (id: string): Promise<Appointment> => {
    const body = await api.get<unknown>(`/appointments/${id}`)
    return fromApiAppointment(body as Record<string, unknown>)
  },

  create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    const body = await api.post<unknown>('/appointments', appointment)
    return fromApiAppointment(body as Record<string, unknown>)
  },

  /** Corps attendu par scheduling-service (camelCase + ISO instant). */
  createRaw: async (payload: {
    personId: string | null
    googleEventId: string | null
    startTime: string
    endTime: string
    status: string
    notes: string | null
  }): Promise<Appointment> => {
    const body = await api.post<unknown>('/appointments', payload)
    return fromApiAppointment(body as Record<string, unknown>)
  },

  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const body = await api.put<unknown>(`/appointments/${id}`, appointment)
    return fromApiAppointment(body as Record<string, unknown>)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`)
  },
}

export const availabilityApi = {
  /**
   * Crée plusieurs créneaux libres (statut pending) entre deux heures locales.
   */
  create: async (params: Omit<AppointmentCreate, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const durationMin = Number(params.appointmentTime) || 30
    const durationMs = durationMin * 60 * 1000
    const dayStart = combineLocalDateAndTime(params.day, params.startTime)
    const dayEnd = combineLocalDateAndTime(params.day, params.endTime)
    let cursor = dayStart.getTime()
    const endMs = dayEnd.getTime()
    if (cursor >= endMs || durationMs <= 0) return 0

    let created = 0
    while (cursor + durationMs <= endMs) {
      const startIso = new Date(cursor).toISOString()
      const endIso = new Date(cursor + durationMs).toISOString()
      await appointmentsApi.createRaw({
        personId: null,
        googleEventId: null,
        startTime: startIso,
        endTime: endIso,
        status: 'pending',
        notes: null,
      })
      created++
      cursor += durationMs
    }
    return created
  },
}

export const calendarApi = {
  availability: availabilityApi,
  appointments: appointmentsApi,
}

export default calendarApi
