package fr.jeroka.billing.web.dto.invoice;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateInvoiceRequest(
        @Size(max = 255) String title,
        String description,
        BigDecimal subtotalHt,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalHt,
        BigDecimal totalVat,
        BigDecimal totalTtc,
        LocalDate issueDate,
        LocalDate dueDate,
        @Size(max = 255) String paymentTerms,
        @Size(max = 50) String paymentMethod,
        String notes,
        @Pattern(regexp = "draft|sent|paid|overdue|cancelled") String status) {}
