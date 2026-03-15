package fr.jeroka.apijava.dto.announcement;

import java.util.List;

/** Réponse liste annonces (alignée avec le frontend). */
public record AnnouncementListDto(boolean success, List<AnnouncementResponse> data) {
    public static AnnouncementListDto empty() {
        return new AnnouncementListDto(true, List.of());
    }
}
