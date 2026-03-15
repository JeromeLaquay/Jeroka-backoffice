package fr.jeroka.apijava.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @Size(max = 255)
        String name,
        String description,
        @Size(max = 500)
        String shortDescription,
        @Size(max = 100)
        String category,
        @DecimalMin("0")
        BigDecimal priceHt,
        @DecimalMin("0")
        BigDecimal vatNumber,
        BigDecimal costPrice,
        Integer stockQuantity,
        Integer minStockLevel,
        @Size(max = 20)
        String unit,
        Boolean active
) {}
