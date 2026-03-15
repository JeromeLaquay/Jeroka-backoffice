package fr.jeroka.apijava.api.google.calendar;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;

import java.util.List;
import java.util.Map;

/**
 * RDV ↔ événements Calendar (créneaux, réservation, couleurs).
 * Les credentials sont fournis par l'appelant (résolution userId → credentials ailleurs).
 */
public interface GoogleCalendarAvailabilityRuleService {

    CalendarEvent createGoogleEvent(GoogleOAuthCredentials credentials,
                                    String startTime, String endTime, String userName);

    List<CalendarEvent> findEventsInRange(GoogleOAuthCredentials credentials,
                                           String startDateTime, String endDateTime);

    CalendarEvent updateGoogleEvent(GoogleOAuthCredentials credentials, String googleEventId,
                                    UpdateEventPayload payload);

    CalendarEvent updateEventColor(GoogleOAuthCredentials credentials, String googleEventId,
                                   CalendarEventType eventType);

    Map<String, GoogleCalendarColors.ColorInfo> getAvailableColors(GoogleOAuthCredentials credentials);

    enum CalendarEventType { AVAILABLE, RESERVED, CONFIRMED, CANCELLED }

    record UpdateEventPayload(String summary, String description, String colorId,
                              List<CalendarEvent.Attendee> attendees) {}
}
