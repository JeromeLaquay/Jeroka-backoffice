package fr.jeroka.apijava.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Réponse paginée liste entreprises (alignée frontend). */
public record AdminCompaniesListResponse(
        boolean success,
        List<AdminCompanyResponse> data,
        Pagination pagination
) {
    public record Pagination(
            int page,
            int limit,
            long total,
            @JsonProperty("totalPages") int totalPages
    ) {}
}
