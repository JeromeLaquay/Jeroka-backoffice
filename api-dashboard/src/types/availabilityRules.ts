export interface AvailabilityRule {
  id: string;
  userId: string;
  day: string;
  startTime: string;
  endTime: string;
  status: string;
  googleEventId: string;
  createdAt: Date;
  updatedAt: Date;
}