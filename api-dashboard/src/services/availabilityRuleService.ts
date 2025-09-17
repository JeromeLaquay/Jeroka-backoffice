import {AvailabilityRulesRepository} from '../repositories/availabilityRulesRepository';
import { AvailabilityRule } from '../types/availabilityRules';
import GoogleCalendarAvailabilityRuleService from '../api/google/calendar/googleCalendarAvailabilityRuleService';

export class AvailabilityRuleService {

  static async createRules(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<AvailabilityRule[]> {
    const availabilityRules = await this.generateAvailabilityRules(userId, day, startTime, endTime, appointmentTime);
    const results = await Promise.all(availabilityRules.map(async (rule: AvailabilityRule) => {
      //const googleEvent = await GoogleCalendarAvailabilityRuleService.createAvailabilityRuleEvent(userId, rule.day, rule.startTime, rule.endTime);
      //if (googleEvent?.id) {
        //rule.googleEventId = googleEvent.id;
        //return AvailabilityRulesRepository.create(userId, rule.day, rule.startTime, rule.endTime, rule.googleEventId);
      //}
      console.log(rule);
      console.log(userId);
      return AvailabilityRulesRepository.create(userId, rule.day, rule.startTime, rule.endTime, '1');
    }));
    return results;
  }

  static async generateAvailabilityRules(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<AvailabilityRule[]> {
    const rules: any[] = [];
    const start = new Date(`${day}T${startTime}`);
    const boundary = new Date(`${day}T${endTime}`);
    let cursor = new Date(start);

    const toHHMMSS = (d: Date) => d.toTimeString().slice(0, 8);

    while (cursor < boundary) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor);
      slotEnd.setMinutes(slotEnd.getMinutes() + appointmentTime);
      if (slotEnd > boundary) break;

      rules.push({
        userId,
        day,
        startTime: toHHMMSS(slotStart),
        endTime: toHHMMSS(slotEnd),
        status: 'pending'
      });

      cursor = slotEnd;
    }

    return rules as AvailabilityRule[];
  }

  static async findPendingWithoutAppointmentByUserId(userId: string) {
    return AvailabilityRulesRepository.findPendingWithoutAppointmentByUserId(userId);
  }
}
export default AvailabilityRuleService;