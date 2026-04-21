package fr.jeroka.billing.web.dto;

import java.util.List;

public record PageDto<T>(List<T> items, int page, int limit, long total, int totalPages) {

    public static <T> PageDto<T> of(List<T> items, int page, int limit, long total) {
        int tp = limit > 0 ? (int) Math.ceil((double) total / limit) : 0;
        return new PageDto<>(items, page, limit, total, tp);
    }
}
