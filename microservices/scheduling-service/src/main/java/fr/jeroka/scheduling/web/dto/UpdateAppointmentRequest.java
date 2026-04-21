package fr.jeroka.scheduling.web.dto;

import jakarta.validation.constraints.Pattern;

import java.time.Instant;

public record UpdateAppointmentRequest(
        Instant startTime,
        Instant endTime,
        @Pattern(regexp = "pending|reserved|confirmed|cancelled|cancelled_by_client") String status,
        String notes) {}
