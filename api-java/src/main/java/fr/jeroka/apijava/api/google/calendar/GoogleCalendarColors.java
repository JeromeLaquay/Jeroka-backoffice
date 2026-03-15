package fr.jeroka.apijava.api.google.calendar;

import java.util.Map;

public record GoogleCalendarColors(
        String kind,
        String updated,
        Map<String, ColorInfo> calendar,
        Map<String, ColorInfo> event
) {
    public record ColorInfo(String background, String foreground) {}
}
