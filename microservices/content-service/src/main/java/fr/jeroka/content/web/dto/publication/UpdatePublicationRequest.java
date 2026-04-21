package fr.jeroka.content.web.dto.publication;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdatePublicationRequest(
        @Size(max = 255) String title,
        String content,
        @Size(max = 500) String excerpt,
        String featuredImage,
        @Pattern(regexp = "standard|promotion|event|announcement|tutorial") String type,
        @Pattern(regexp = "draft|scheduled|published|archived") String status,
        @Size(max = 100) String category,
        @Size(max = 255) String slug,
        Instant scheduledAt,
        Instant publishedAt,
        @Size(max = 255) String seoTitle,
        String seoDescription) {}
