package fr.jeroka.organization.web.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record OrgUpdateUserRequest(
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @Email String email,
        @Size(max = 50) String role) {}
