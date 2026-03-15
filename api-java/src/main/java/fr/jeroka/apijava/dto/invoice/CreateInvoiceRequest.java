package fr.jeroka.apijava.dto.invoice;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateInvoiceRequest(
        UUID quoteId,
        @NotNull
        UUID personId,
        @Size(max = 255)
        String title,
        String description,
        BigDecimal subtotalHt,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalHt,
        BigDecimal totalVat,
        BigDecimal totalTtc,
        LocalDate issueDate,
        LocalDate dueDate,
        @Size(max = 255)
        String paymentTerms,
        String notes
) {}
