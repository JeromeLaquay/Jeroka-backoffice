package fr.jeroka.apijava.dto.invoice;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceResponse(
        String id,
        String invoiceNumber,
        UUID quoteId,
        UUID personId,
        String status,
        String title,
        String description,
        BigDecimal subtotalHt,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalHt,
        BigDecimal totalVat,
        BigDecimal totalTtc,
        BigDecimal amountPaid,
        BigDecimal amountDue,
        LocalDate issueDate,
        LocalDate dueDate,
        String paymentTerms,
        String paymentMethod,
        String notes,
        Instant paidAt,
        Instant createdAt,
        Instant updatedAt
) {}
