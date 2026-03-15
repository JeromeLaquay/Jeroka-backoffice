package fr.jeroka.apijava.api.google.calendar;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;

import java.util.List;

/**
 * Contrat pour l'intégration Google Calendar (list, create, update, delete, colors).
 */
public interface GoogleCalendarService {

    List<CalendarEvent> listEvents(GoogleOAuthCredentials credentials,
                                   String timeMin, String timeMax, int maxResults);

    CalendarEvent createEvent(GoogleOAuthCredentials credentials, CalendarEvent event);

    CalendarEvent updateEvent(GoogleOAuthCredentials credentials, String eventId, CalendarEvent updates);

    boolean deleteEvent(GoogleOAuthCredentials credentials, String eventId);

    GoogleCalendarColors getColors(GoogleOAuthCredentials credentials);

    boolean testConnection(GoogleOAuthCredentials credentials);
}
