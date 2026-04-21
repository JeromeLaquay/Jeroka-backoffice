package fr.jeroka.crm.web.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateMessageRequestDto(
        @Pattern(regexp = "new|read|replied|archived") String status,
        @Size(max = 10) String priority
) {}
