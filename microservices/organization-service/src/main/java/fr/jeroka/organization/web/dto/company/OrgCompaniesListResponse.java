package fr.jeroka.organization.web.dto.company;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record OrgCompaniesListResponse(
        boolean success,
        List<OrgAdminCompanyResponse> data,
        Pagination pagination) {
    public record Pagination(
            int page,
            int limit,
            long total,
            @JsonProperty("totalPages") int totalPages) {}
}
