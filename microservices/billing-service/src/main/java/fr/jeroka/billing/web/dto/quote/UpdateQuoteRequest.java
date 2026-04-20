package fr.jeroka.billing.web.dto.quote;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateQuoteRequest(
        @Size(max = 255) String title,
        String description,
        BigDecimal subtotalHt,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalHt,
        BigDecimal totalVat,
        BigDecimal totalTtc,
        LocalDate validUntil,
        String notes,
        @Size(max = 255) String paymentTerms,
        @Pattern(regexp = "draft|sent|accepted|rejected|expired") String status) {}
