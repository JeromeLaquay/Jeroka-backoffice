package fr.jeroka.organization.web.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record OrgAdminUsersListResponse(
        boolean success,
        List<OrgAdminUserResponse> data,
        Pagination pagination) {

    public record Pagination(
            int page,
            int limit,
            long total,
            @JsonProperty("totalPages") int totalPages) {}
}
