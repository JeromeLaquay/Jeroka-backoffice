package fr.jeroka.apijava.dto.product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        String id,
        String name,
        String description,
        String shortDescription,
        String sku,
        String category,
        BigDecimal priceHt,
        BigDecimal vatNumber,
        BigDecimal costPrice,
        Integer stockQuantity,
        Integer minStockLevel,
        String unit,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
