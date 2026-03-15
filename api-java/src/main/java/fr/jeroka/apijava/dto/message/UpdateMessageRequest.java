package fr.jeroka.apijava.dto.message;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateMessageRequest(
        @Pattern(regexp = "new|read|replied|archived")
        String status,
        @Size(max = 10)
        String priority
) {}
