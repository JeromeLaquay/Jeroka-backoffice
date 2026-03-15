package fr.jeroka.apijava.dto.common;

import java.util.List;

/**
 * Réponse paginée générique (alignée API Node : data + meta).
 */
public record PageDto<T>(
        List<T> items,
        int page,
        int limit,
        long total,
        int totalPages
) {
    public static <T> PageDto<T> of(List<T> items, int page, int limit, long total) {
        int totalPages = limit > 0 ? (int) Math.ceil((double) total / limit) : 0;
        return new PageDto<>(items, page, limit, total, totalPages);
    }
}
