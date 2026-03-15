package fr.jeroka.apijava.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank @Size(max = 255)
        String name,
        String description,
        @Size(max = 500)
        String shortDescription,
        @NotBlank @Size(max = 100)
        String sku,
        @Size(max = 100)
        String category,
        @NotNull @DecimalMin("0")
        BigDecimal priceHt,
        @DecimalMin("0")
        BigDecimal vatNumber,
        BigDecimal costPrice,
        Integer stockQuantity,
        Integer minStockLevel,
        @Size(max = 20)
        String unit
) {}
