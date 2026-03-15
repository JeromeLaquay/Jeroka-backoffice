package fr.jeroka.apijava.dto.appointment;

import java.time.Instant;
import java.util.UUID;

public record AppointmentResponse(
        String id,
        UUID userId,
        UUID personId,
        String googleEventId,
        String status,
        Instant startTime,
        Instant endTime,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {}
