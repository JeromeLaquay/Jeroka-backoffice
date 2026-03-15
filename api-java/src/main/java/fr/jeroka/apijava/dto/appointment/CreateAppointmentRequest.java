package fr.jeroka.apijava.dto.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateAppointmentRequest(
        UUID personId,
        @Size(max = 255)
        String googleEventId,
        @NotNull
        Instant startTime,
        @NotNull
        Instant endTime,
        @Size(max = 20)
        String status,
        String notes
) {}
