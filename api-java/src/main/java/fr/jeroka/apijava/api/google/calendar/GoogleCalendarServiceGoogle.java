package fr.jeroka.apijava.api.google.calendar;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import fr.jeroka.apijava.api.google.GoogleTokenRefresh;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implémentation réelle : appels HTTP à l'API Google Calendar v3.
 * Activée lorsque {@code app.google.calendar.enabled=true}.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.google.calendar.enabled', 'false') == 'true'")
public class GoogleCalendarServiceGoogle implements GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarServiceGoogle.class);
    private static final String CALENDAR_BASE = "https://www.googleapis.com/calendar/v3/calendars";
    private static final String COLORS_URL = "https://www.googleapis.com/calendar/v3/colors";

    @Value("${app.google.calendar-id:primary}")
    private String calendarId;

    private RestClient restClient(String token) {
        return RestClient.builder().defaultHeader("Authorization", "Bearer " + token).build();
    }

    private String resolveToken(GoogleOAuthCredentials c) {
        if (c == null) return null;
        if (c.accessToken() != null && !c.accessToken().isBlank()) return c.accessToken();
        return GoogleTokenRefresh.refreshAccessToken(c);
    }

    @Override
    public List<CalendarEvent> listEvents(GoogleOAuthCredentials credentials, String timeMin, String timeMax, int maxResults) {
        String token = resolveToken(credentials);
        if (token == null) return List.of();
        StringBuilder uri = new StringBuilder(CALENDAR_BASE + "/" + encode(calendarId) + "/events?maxResults=" + maxResults + "&singleEvents=true&orderBy=startTime");
        if (timeMin != null) uri.append("&timeMin=").append(encode(timeMin));
        if (timeMax != null) uri.append("&timeMax=").append(encode(timeMax));
        try {
            Map<?, ?> res = restClient(token).get().uri(uri.toString()).retrieve().body(Map.class);
            return mapEvents(res);
        } catch (Exception e) {
            log.warn("Calendar listEvents error: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public CalendarEvent createEvent(GoogleOAuthCredentials credentials, CalendarEvent event) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        Map<String, Object> body = buildEventBody(event);
        try {
            Map<?, ?> res = restClient(token).post()
                    .uri(CALENDAR_BASE + "/" + encode(calendarId) + "/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return toEvent(res);
        } catch (Exception e) {
            log.warn("Calendar createEvent error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public CalendarEvent updateEvent(GoogleOAuthCredentials credentials, String eventId, CalendarEvent updates) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        Map<String, Object> body = buildEventBody(updates);
        try {
            Map<?, ?> res = restClient(token).patch()
                    .uri(CALENDAR_BASE + "/" + encode(calendarId) + "/events/" + encode(eventId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return toEvent(res);
        } catch (Exception e) {
            log.warn("Calendar updateEvent error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean deleteEvent(GoogleOAuthCredentials credentials, String eventId) {
        String token = resolveToken(credentials);
        if (token == null) return false;
        try {
            restClient(token).delete()
                    .uri(CALENDAR_BASE + "/" + encode(calendarId) + "/events/" + encode(eventId))
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.warn("Calendar deleteEvent error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public GoogleCalendarColors getColors(GoogleOAuthCredentials credentials) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        try {
            Map<?, ?> res = restClient(token).get().uri(COLORS_URL).retrieve().body(Map.class);
            if (res == null) return null;
            @SuppressWarnings("unchecked")
            Map<String, GoogleCalendarColors.ColorInfo> cal = res.get("calendar") != null ? (Map<String, GoogleCalendarColors.ColorInfo>) res.get("calendar") : Map.of();
            @SuppressWarnings("unchecked")
            Map<String, GoogleCalendarColors.ColorInfo> ev = res.get("event") != null ? (Map<String, GoogleCalendarColors.ColorInfo>) res.get("event") : Map.of();
            return new GoogleCalendarColors(String.valueOf(res.get("kind")), String.valueOf(res.get("updated")), cal, ev);
        } catch (Exception e) {
            log.warn("Calendar getColors error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean testConnection(GoogleOAuthCredentials credentials) {
        return listEvents(credentials, null, null, 1) != null;
    }

    private static String encode(String s) {
        return java.net.URLEncoder.encode(s == null ? "" : s, java.nio.charset.StandardCharsets.UTF_8);
    }

    @SuppressWarnings("unchecked")
    private List<CalendarEvent> mapEvents(Map<?, ?> res) {
        List<CalendarEvent> out = new ArrayList<>();
        Object items = res != null ? res.get("items") : null;
        if (!(items instanceof List)) return out;
        for (Object o : (List<?>) items) {
            if (o instanceof Map) out.add(toEvent((Map<?, ?>) o));
        }
        return out;
    }

    private static Map<String, Object> buildEventBody(CalendarEvent e) {
        Map<String, Object> body = new java.util.HashMap<>();
        if (e.summary() != null) body.put("summary", e.summary());
        if (e.description() != null) body.put("description", e.description());
        if (e.start() != null) body.put("start", Map.of("dateTime", e.start().dateTime(), "timeZone", e.start().timeZone() != null ? e.start().timeZone() : "Europe/Paris"));
        if (e.end() != null) body.put("end", Map.of("dateTime", e.end().dateTime(), "timeZone", e.end().timeZone() != null ? e.end().timeZone() : "Europe/Paris"));
        if (e.location() != null) body.put("location", e.location());
        if (e.colorId() != null) body.put("colorId", e.colorId());
        if (e.attendees() != null) body.put("attendees", e.attendees().stream().map(a -> Map.of("email", a.email(), "responseStatus", a.responseStatus() != null ? a.responseStatus() : "needsAction")).toList());
        return body;
    }

    @SuppressWarnings("unchecked")
    private static CalendarEvent toEvent(Map<?, ?> ev) {
        if (ev == null || ev.get("id") == null) return null;
        Map<String, String> start = (Map<String, String>) ev.get("start");
        Map<String, String> end = (Map<String, String>) ev.get("end");
        List<CalendarEvent.Attendee> attendees = new ArrayList<>();
        Object at = ev.get("attendees");
        if (at instanceof List<?> list)
            for (Object a : list)
                if (a instanceof Map<?, ?> m)
                    attendees.add(new CalendarEvent.Attendee(String.valueOf(m.get("email")), String.valueOf(m.get("responseStatus"))));
        return new CalendarEvent(
                String.valueOf(ev.get("id")),
                (String) ev.get("summary"),
                (String) ev.get("description"),
                start != null ? new CalendarEvent.EventDateTime(start.get("dateTime"), start.get("timeZone")) : null,
                end != null ? new CalendarEvent.EventDateTime(end.get("dateTime"), end.get("timeZone")) : null,
                (String) ev.get("location"),
                attendees.isEmpty() ? null : attendees,
                (String) ev.get("colorId"));
    }
}
