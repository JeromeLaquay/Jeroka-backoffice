package fr.jeroka.apijava.dto.person;

import java.time.Instant;

public record PersonResponse(
        String id,
        String type,
        String typeClient,
        String firstName,
        String lastName,
        String companyName,
        String email,
        String phone,
        String mobile,
        String status,
        String city,
        String postalCode,
        String country,
        Instant createdAt,
        Instant updatedAt
) {}
