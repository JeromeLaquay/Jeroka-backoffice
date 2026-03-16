package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.accounting.AccountingTransactionsResponse;
import fr.jeroka.apijava.dto.accounting.FinancialStatsResponse;
import fr.jeroka.apijava.entity.Invoice;
import fr.jeroka.apijava.repository.InvoiceRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AccountingService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal DEFAULT_VAT_RATE = BigDecimal.valueOf(20);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneId.systemDefault());

    private final InvoiceRepository invoiceRepository;

    public AccountingService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public FinancialStatsResponse getFinancialStats(UUID companyId, String period) {
        var totalRevenue = nvl(invoiceRepository.sumTotalTtcByCompanyId(companyId));
        var totalExpenses = BigDecimal.ZERO;
        var netProfit = totalRevenue.subtract(totalExpenses);
        var margin = totalRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : netProfit.multiply(HUNDRED).divide(totalRevenue, 1, RoundingMode.HALF_UP);
        var vatOwed = totalRevenue
                .multiply(DEFAULT_VAT_RATE)
                .divide(HUNDRED, 2, RoundingMode.HALF_UP);
        var paid = nvl(invoiceRepository.sumAmountPaidByCompanyId(companyId));
        var cashFlow = paid.subtract(totalExpenses);
        var outstanding = invoiceRepository.countByCompanyIdAndStatus(companyId, "sent");
        var overdue = invoiceRepository.countByCompanyIdAndStatus(companyId, "overdue");
        var stats = new FinancialStatsResponse.FinancialStats(
                totalRevenue,
                totalExpenses,
                netProfit,
                margin,
                vatOwed,
                outstanding,
                overdue,
                cashFlow,
                List.of(),
                List.of(),
                List.of()
        );
        return new FinancialStatsResponse(stats);
    }

    public AccountingTransactionsResponse getRecentTransactions(UUID companyId, int limit) {
        var page = invoiceRepository.findByCompanyIdOrderByCreatedAtDesc(
                companyId,
                PageRequest.of(0, Math.max(limit, 1))
        );
        var items = page.getContent().stream()
                .map(this::toTransaction)
                .toList();
        var data = new AccountingTransactionsResponse.TransactionsPage(items, page.getTotalElements());
        return new AccountingTransactionsResponse(data);
    }

    private AccountingTransactionsResponse.TransactionDto toTransaction(Invoice i) {
        var vatAmount = nvl(i.getTotalVat());
        var ht = nvl(i.getTotalHt());
        var vatRate = ht.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : vatAmount.multiply(HUNDRED).divide(ht, 2, RoundingMode.HALF_UP);
        var description = i.getTitle() != null && !i.getTitle().isBlank()
                ? i.getTitle()
                : i.getDescription();
        var status = switch (i.getStatus()) {
            case "paid" -> "completed";
            case "overdue" -> "pending";
            default -> "pending";
        };
        return new AccountingTransactionsResponse.TransactionDto(
                i.getId().toString(),
                "income",
                "Ventes",
                description,
                nvl(i.getTotalTtc()).doubleValue(),
                vatAmount.doubleValue(),
                vatRate.doubleValue(),
                DATE_FORMATTER.format(i.getIssueDate()),
                i.getId().toString(),
                i.getPersonId().toString(),
                null,
                i.getInvoiceNumber(),
                i.getPaymentMethod(),
                status,
                i.getNotes()
        );
    }

    private static BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

