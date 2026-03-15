package fr.jeroka.apijava.api.socialnetwork;

import java.time.Instant;
import java.util.List;

public record PublishContent(
        String text,
        String imageUrl,
        String linkUrl,
        List<String> hashtags,
        Instant scheduledAt
) {}
