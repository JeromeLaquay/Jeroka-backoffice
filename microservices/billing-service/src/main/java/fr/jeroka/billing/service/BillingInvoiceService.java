package fr.jeroka.billing.service;

import fr.jeroka.billing.entity.BillingInvoiceEntity;
import fr.jeroka.billing.exception.BillingApiException;
import fr.jeroka.billing.repository.BillingInvoiceRepository;
import fr.jeroka.billing.web.dto.PageDto;
import fr.jeroka.billing.web.dto.invoice.CreateInvoiceRequest;
import fr.jeroka.billing.web.dto.invoice.InvoiceDashboardAnalyticsResponse;
import fr.jeroka.billing.web.dto.invoice.InvoiceResponse;
import fr.jeroka.billing.web.dto.invoice.InvoiceStatsResponse;
import fr.jeroka.billing.web.dto.invoice.MonthlyRevenueRow;
import fr.jeroka.billing.web.dto.invoice.UpdateInvoiceRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BillingInvoiceService {

    private final BillingInvoiceRepository invoices;

    public BillingInvoiceService(BillingInvoiceRepository invoices) {
        this.invoices = invoices;
    }

    @Transactional(readOnly = true)
    public PageDto<InvoiceResponse> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = invoices.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
        var items = result.getContent().stream().map(BillingInvoiceMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(UUID id, UUID companyId) {
        return BillingInvoiceMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public InvoiceResponse create(UUID companyId, CreateInvoiceRequest req) {
        var i = BillingInvoiceMapper.toNewEntity(companyId, req);
        if (i.getInvoiceNumber() == null || i.getInvoiceNumber().isBlank()) {
            i.setInvoiceNumber(nextInvoiceNumberInternal(companyId));
        }
        return BillingInvoiceMapper.toResponse(invoices.save(i));
    }

    @Transactional
    public InvoiceResponse update(UUID id, UUID companyId, UpdateInvoiceRequest req) {
        BillingInvoiceEntity i = loadOwned(id, companyId);
        BillingInvoiceMapper.applyUpdate(i, req);
        return BillingInvoiceMapper.toResponse(invoices.save(i));
    }

    @Transactional
    public InvoiceResponse markPaid(UUID id, UUID companyId, BigDecimal amount) {
        BillingInvoiceEntity inv = loadOwned(id, companyId);
        applyPayment(inv, amount);
        return BillingInvoiceMapper.toResponse(invoices.save(inv));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        invoices.deleteById(id);
    }

    @Transactional(readOnly = true)
    public String nextInvoiceNumber(UUID companyId) {
        return nextInvoiceNumberInternal(companyId);
    }

    @Transactional(readOnly = true)
    public InvoiceStatsResponse stats(UUID companyId) {
        long total = invoices.countByCompanyId(companyId);
        Instant startOfMonth =
                YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        long createdThisMonth = invoices.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        return new InvoiceStatsResponse(
                total,
                invoices.countByCompanyIdAndStatus(companyId, "draft"),
                invoices.countByCompanyIdAndStatus(companyId, "sent"),
                invoices.countByCompanyIdAndStatus(companyId, "paid"),
                invoices.countByCompanyIdAndStatus(companyId, "overdue"),
                invoices.countByCompanyIdAndStatus(companyId, "cancelled"),
                nvl(invoices.sumTotalTtcByCompanyId(companyId)),
                nvl(invoices.sumAmountPaidByCompanyId(companyId)),
                nvl(invoices.sumAmountDueByCompanyId(companyId)),
                createdThisMonth);
    }

    @Transactional(readOnly = true)
    public InvoiceDashboardAnalyticsResponse dashboardAnalytics(UUID companyId) {
        return new InvoiceDashboardAnalyticsResponse(
                mapMonthlyRevenue(invoices.findMonthlyRevenueLast12(companyId)),
                mapInvoiceStatusCounts(invoices.countInvoicesByStatus(companyId)));
    }

    private static List<MonthlyRevenueRow> mapMonthlyRevenue(List<Object[]> rows) {
        return rows.stream()
                .map(r -> new MonthlyRevenueRow((String) r[0], new BigDecimal(r[1].toString())))
                .toList();
    }

    private static Map<String, Long> mapInvoiceStatusCounts(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], toLongCount(row[1]));
        }
        return map;
    }

    private static long toLongCount(Object value) {
        if (value instanceof Number n) {
            return n.longValue();
        }
        return 0L;
    }

    private void applyPayment(BillingInvoiceEntity inv, BigDecimal amount) {
        BigDecimal paid = nvl(inv.getAmountPaid());
        BigDecimal add = amount != null ? amount : nvl(inv.getTotalTtc());
        inv.setAmountPaid(paid.add(add));
        inv.setAmountDue(nvl(inv.getTotalTtc()).subtract(inv.getAmountPaid()));
        if (inv.getAmountDue().compareTo(BigDecimal.ZERO) <= 0) {
            inv.setStatus("paid");
            inv.setPaidAt(Instant.now());
        }
    }

    private BillingInvoiceEntity loadOwned(UUID id, UUID companyId) {
        return invoices
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BillingApiException("Facture introuvable", HttpStatus.NOT_FOUND));
    }

    private String nextInvoiceNumberInternal(UUID companyId) {
        return invoices
                .findFirstByCompanyIdOrderByInvoiceNumberDesc(companyId)
                .map(i -> incrementFac(i.getInvoiceNumber()))
                .orElse("FAC-001");
    }

    private static String incrementFac(String last) {
        if (last == null || !last.contains("-")) {
            return "FAC-001";
        }
        try {
            int num = Integer.parseInt(last.substring(last.lastIndexOf('-') + 1));
            return last.substring(0, last.lastIndexOf('-') + 1) + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "FAC-001";
        }
    }

    private static BigDecimal nvl(BigDecimal b) {
        return b != null ? b : BigDecimal.ZERO;
    }
}
