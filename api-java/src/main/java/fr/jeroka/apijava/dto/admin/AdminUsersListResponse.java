package fr.jeroka.apijava.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Réponse paginée liste utilisateurs admin. */
public record AdminUsersListResponse(
        boolean success,
        List<AdminUserResponse> data,
        Pagination pagination
) {
    public record Pagination(
            int page,
            int limit,
            long total,
            @JsonProperty("totalPages") int totalPages
    ) {}
}
