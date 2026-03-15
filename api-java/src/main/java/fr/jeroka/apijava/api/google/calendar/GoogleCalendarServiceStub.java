package fr.jeroka.apijava.api.google.calendar;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Implémentation in-memory (stub) : événements et couleurs fictifs.
 * Bean créé par ApiStubsConfig.
 */
public class GoogleCalendarServiceStub implements GoogleCalendarService {

    private static final List<CalendarEvent> EVENTS = new CopyOnWriteArrayList<>();
    private static final Map<String, GoogleCalendarColors.ColorInfo> EVENT_COLORS = Map.of(
            "1", new GoogleCalendarColors.ColorInfo("#7986cb", "#000000"),
            "2", new GoogleCalendarColors.ColorInfo("#33b679", "#000000"),
            "9", new GoogleCalendarColors.ColorInfo("#3f51b5", "#000000"),
            "10", new GoogleCalendarColors.ColorInfo("#0d8043", "#000000"),
            "11", new GoogleCalendarColors.ColorInfo("#d60000", "#000000")
    );

    @Override
    public List<CalendarEvent> listEvents(GoogleOAuthCredentials credentials,
                                          String timeMin, String timeMax, int maxResults) {
        List<CalendarEvent> out = new ArrayList<>();
        int n = 0;
        for (CalendarEvent e : EVENTS) {
            if (n >= maxResults) break;
            if (inRange(e, timeMin, timeMax)) {
                out.add(e);
                n++;
            }
        }
        return out;
    }

    @Override
    public CalendarEvent createEvent(GoogleOAuthCredentials credentials, CalendarEvent event) {
        String id = event.id() != null ? event.id() : UUID.randomUUID().toString();
        CalendarEvent withId = new CalendarEvent(id, event.summary(), event.description(),
                event.start(), event.end(), event.location(), event.attendees(), event.colorId());
        EVENTS.add(withId);
        return withId;
    }

    @Override
    public CalendarEvent updateEvent(GoogleOAuthCredentials credentials, String eventId, CalendarEvent updates) {
        for (int i = 0; i < EVENTS.size(); i++) {
            if (eventId.equals(EVENTS.get(i).id())) {
                CalendarEvent cur = EVENTS.get(i);
                CalendarEvent merged = merge(cur, updates);
                EVENTS.set(i, merged);
                return merged;
            }
        }
        return null;
    }

    @Override
    public boolean deleteEvent(GoogleOAuthCredentials credentials, String eventId) {
        return EVENTS.removeIf(e -> eventId.equals(e.id()));
    }

    @Override
    public GoogleCalendarColors getColors(GoogleOAuthCredentials credentials) {
        return new GoogleCalendarColors("calendar#colors", null, Map.of(), EVENT_COLORS);
    }

    @Override
    public boolean testConnection(GoogleOAuthCredentials credentials) {
        return true;
    }

    private static boolean inRange(CalendarEvent e, String timeMin, String timeMax) {
        String start = e.start() != null ? e.start().dateTime() : null;
        String end = e.end() != null ? e.end().dateTime() : null;
        if (start == null) return false;
        if (timeMin != null && start.compareTo(timeMin) < 0) return false;
        if (timeMax != null && end != null && end.compareTo(timeMax) > 0) return false;
        return true;
    }

    private static CalendarEvent merge(CalendarEvent cur, CalendarEvent updates) {
        return new CalendarEvent(cur.id(),
                updates.summary() != null ? updates.summary() : cur.summary(),
                updates.description() != null ? updates.description() : cur.description(),
                updates.start() != null ? updates.start() : cur.start(),
                updates.end() != null ? updates.end() : cur.end(),
                updates.location() != null ? updates.location() : cur.location(),
                updates.attendees() != null ? updates.attendees() : cur.attendees(),
                updates.colorId() != null ? updates.colorId() : cur.colorId());
    }
}
