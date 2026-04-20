package fr.jeroka.billing.service;

import fr.jeroka.billing.entity.BillingInvoiceEntity;
import fr.jeroka.billing.repository.BillingInvoiceRepository;
import fr.jeroka.billing.web.dto.accounting.AccountingTransactionsResponse;
import fr.jeroka.billing.web.dto.accounting.FinancialStatsResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class BillingAccountingService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal DEFAULT_VAT_RATE = BigDecimal.valueOf(20);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneId.systemDefault());

    private final BillingInvoiceRepository invoices;

    public BillingAccountingService(BillingInvoiceRepository invoices) {
        this.invoices = invoices;
    }

    /**
     * Agrégats sur les factures (aligné core).
     *
     * @param period réservé (ex. month/year) pour filtrage futur ; même résultat pour l’instant.
     */
    @Transactional(readOnly = true)
    @SuppressWarnings("unused")
    public FinancialStatsResponse financialStats(UUID companyId, String period) {
        BigDecimal totalRevenue = nvl(invoices.sumTotalTtcByCompanyId(companyId));
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        BigDecimal margin = totalRevenue.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : netProfit.multiply(HUNDRED).divide(totalRevenue, 1, RoundingMode.HALF_UP);
        BigDecimal vatOwed =
                totalRevenue.multiply(DEFAULT_VAT_RATE).divide(HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal paid = nvl(invoices.sumAmountPaidByCompanyId(companyId));
        BigDecimal cashFlow = paid.subtract(totalExpenses);
        long outstanding = invoices.countByCompanyIdAndStatus(companyId, "sent");
        long overdue = invoices.countByCompanyIdAndStatus(companyId, "overdue");
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
                List.of());
        return new FinancialStatsResponse(stats);
    }

    @Transactional(readOnly = true)
    public AccountingTransactionsResponse recentTransactions(UUID companyId, int limit) {
        int safe = Math.max(1, limit);
        var page = invoices.findByCompanyIdOrderByCreatedAtDesc(companyId, PageRequest.of(0, safe));
        var items = page.getContent().stream().map(this::toTransaction).toList();
        var data = new AccountingTransactionsResponse.TransactionsPage(items, page.getTotalElements());
        return new AccountingTransactionsResponse(data);
    }

    private AccountingTransactionsResponse.TransactionDto toTransaction(BillingInvoiceEntity i) {
        BigDecimal vatAmount = nvl(i.getTotalVat());
        BigDecimal ht = nvl(i.getTotalHt());
        BigDecimal vatRate = ht.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : vatAmount.multiply(HUNDRED).divide(ht, 2, RoundingMode.HALF_UP);
        String description = i.getTitle() != null && !i.getTitle().isBlank()
                ? i.getTitle()
                : i.getDescription();
        String status = switch (i.getStatus()) {
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
                i.getNotes());
    }

    private static BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
