package fr.jeroka.billing.web.dto.accounting;

import java.util.List;

public record AccountingTransactionsResponse(TransactionsPage data) {

    public record TransactionsPage(List<TransactionDto> transactions, long total) {}

    public record TransactionDto(
            String id,
            String type,
            String category,
            String description,
            double amount,
            double vatAmount,
            double vatRate,
            String date,
            String invoiceId,
            String clientId,
            String supplierId,
            String reference,
            String paymentMethod,
            String status,
            String notes) {}
}
