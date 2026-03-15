package fr.jeroka.apijava.dto.publication;

import java.time.Instant;

public record PublicationResponse(
        String id,
        String title,
        String content,
        String excerpt,
        String featuredImage,
        String type,
        String status,
        String category,
        String slug,
        Integer viewCount,
        Integer likeCount,
        Integer shareCount,
        Instant scheduledAt,
        Instant publishedAt,
        String seoTitle,
        String seoDescription,
        Instant createdAt,
        Instant updatedAt
) {}
