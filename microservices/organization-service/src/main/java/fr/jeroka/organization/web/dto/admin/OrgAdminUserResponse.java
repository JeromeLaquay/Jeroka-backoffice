package fr.jeroka.organization.web.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record OrgAdminUserResponse(
        String id,
        String email,
        String first_name,
        String last_name,
        String role,
        boolean is_active,
        String created_at,
        String updated_at,
        String company_name) {}
