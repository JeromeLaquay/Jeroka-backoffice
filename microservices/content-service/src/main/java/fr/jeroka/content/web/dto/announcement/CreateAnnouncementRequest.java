package fr.jeroka.content.web.dto.announcement;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

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
        String authorId) {}
