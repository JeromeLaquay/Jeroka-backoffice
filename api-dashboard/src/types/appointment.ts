export interface Appointment {
  id: string;
  availabilityRuleId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDTO {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  availabilityRuleId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}