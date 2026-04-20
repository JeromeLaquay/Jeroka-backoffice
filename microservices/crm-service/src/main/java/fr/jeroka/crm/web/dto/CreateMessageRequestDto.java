package fr.jeroka.crm.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMessageRequestDto(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Size(max = 255) String email,
        @Size(max = 20) String phone,
        @Size(max = 255) String company,
        @NotBlank @Size(max = 500) String subject,
        @NotBlank String message,
        @Size(max = 10) String priority,
        @Size(max = 20) String source
) {}
