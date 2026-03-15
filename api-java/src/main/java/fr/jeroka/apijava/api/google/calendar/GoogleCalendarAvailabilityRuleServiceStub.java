package fr.jeroka.apijava.api.google.calendar;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Stub : délègue au GoogleCalendarService. Bean créé par scan (dépend de GoogleCalendarService).
 */
@Component
public class GoogleCalendarAvailabilityRuleServiceStub implements GoogleCalendarAvailabilityRuleService {

    private static final String COLOR_SAGE = "2";
    private static final String COLOR_BLUEBERRY = "9";
    private static final String COLOR_BASIL = "10";
    private static final String COLOR_TOMATO = "11";
    private static final String COLOR_GRAPHITE = "8";

    private final GoogleCalendarService calendarService;

    public GoogleCalendarAvailabilityRuleServiceStub(GoogleCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @Override
    public CalendarEvent createGoogleEvent(GoogleOAuthCredentials credentials,
                                           String startTime, String endTime, String userName) {
        var start = new CalendarEvent.EventDateTime(startTime, "Europe/Paris");
        var end = new CalendarEvent.EventDateTime(endTime, "Europe/Paris");
        var summary = "Dispo RDV " + userName;
        var description = "Créneau disponible pour rendez-vous";
        var colorId = mapEventColor(CalendarEventType.AVAILABLE);
        var event = new CalendarEvent(null, summary, description, start, end, null, null, colorId);
        return calendarService.createEvent(credentials, event);
    }

    @Override
    public List<CalendarEvent> findEventsInRange(GoogleOAuthCredentials credentials,
                                                  String startDateTime, String endDateTime) {
        int maxResults = 50;
        return calendarService.listEvents(credentials, startDateTime, endDateTime, maxResults);
    }

    @Override
    public CalendarEvent updateGoogleEvent(GoogleOAuthCredentials credentials, String googleEventId,
                                          UpdateEventPayload payload) {
        var event = new CalendarEvent(
                null,
                payload.summary(),
                payload.description(),
                null,
                null,
                null,
                payload.attendees(),
                payload.colorId()
        );
        return calendarService.updateEvent(credentials, googleEventId, event);
    }

    @Override
    public CalendarEvent updateEventColor(GoogleOAuthCredentials credentials, String googleEventId,
                                          CalendarEventType eventType) {
        var colorId = mapEventColor(eventType);
        var event = new CalendarEvent(null, null, null, null, null, null, null, colorId);
        return calendarService.updateEvent(credentials, googleEventId, event);
    }

    @Override
    public Map<String, GoogleCalendarColors.ColorInfo> getAvailableColors(GoogleOAuthCredentials credentials) {
        var colors = calendarService.getColors(credentials);
        return colors != null ? colors.event() : Collections.emptyMap();
    }

    private static String mapEventColor(CalendarEventType type) {
        return switch (type) {
            case AVAILABLE -> COLOR_SAGE;
            case RESERVED -> COLOR_BLUEBERRY;
            case CONFIRMED -> COLOR_BASIL;
            case CANCELLED -> COLOR_TOMATO;
        };
    }
}
