package fr.jeroka.auth.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ChangePasswordRequestBody(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8) String newPassword,
        String confirmPassword
) {}
