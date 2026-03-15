package fr.jeroka.apijava.dto.announcement;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Réponse annonce (aligné avec le frontend AnnouncementsView).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AnnouncementResponse(
        String id,
        String title,
        String summary,
        String content,
        String type,
        String priority,
        String status,
        String version,
        List<String> targetAudience,
        boolean isPinned,
        boolean sendNotification,
        int views,
        String createdAt,
        String updatedAt,
        String scheduledAt,
        String publishedAt,
        AuthorInfo author
) {
    public record AuthorInfo(String id, String name, String email) {}
}
