package fr.jeroka.apijava.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Corps de création d'annonce (aligné frontend). */
public record CreateAnnouncementRequest(
        @NotBlank String title,
        @NotBlank String summary,
        @NotBlank String content,
        @NotBlank String type,
        @NotBlank String priority,
        @NotBlank String status,
        String version,
        List<String> targetAudience,
        boolean isPinned,
        boolean sendNotification,
        String scheduledAt,
        String authorId
) {}
