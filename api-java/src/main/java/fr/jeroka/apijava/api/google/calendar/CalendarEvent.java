package fr.jeroka.apijava.api.google.calendar;

import java.util.List;

public record CalendarEvent(
        String id,
        String summary,
        String description,
        EventDateTime start,
        EventDateTime end,
        String location,
        List<Attendee> attendees,
        String colorId
) {
    public record EventDateTime(String dateTime, String timeZone) {}
    public record Attendee(String email, String responseStatus) {}
}
