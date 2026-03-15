package fr.jeroka.apijava.api.google;

import java.util.List;

public record DriveFileSummary(
        String id,
        String name,
        String mimeType,
        String type,
        String webViewLink,
        List<DriveFileSummary> children
) {
    public static final String TYPE_FOLDER = "folder";
    public static final String TYPE_FILE = "file";
}
