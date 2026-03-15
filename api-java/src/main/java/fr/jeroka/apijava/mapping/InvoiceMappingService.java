package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.invoice.*;
import fr.jeroka.apijava.entity.Invoice;
import fr.jeroka.apijava.service.InvoiceService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class InvoiceMappingService {

    private final InvoiceService invoiceService;

    public InvoiceMappingService(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    public PageDto<InvoiceResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = invoiceService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public InvoiceResponse getById(UUID id, UUID companyId) {
        return toResponse(invoiceService.getByIdAndCompanyId(id, companyId));
    }

    public InvoiceResponse create(UUID companyId, CreateInvoiceRequest request) {
        var invoice = toEntity(companyId, request);
        return toResponse(invoiceService.create(invoice));
    }

    public InvoiceResponse update(UUID id, UUID companyId, UpdateInvoiceRequest request) {
        var invoice = invoiceService.getByIdAndCompanyId(id, companyId);
        applyUpdate(invoice, request);
        return toResponse(invoiceService.update(invoice));
    }

    public InvoiceResponse markPaid(UUID id, UUID companyId, BigDecimal amount) {
        return toResponse(invoiceService.markPaid(id, companyId, amount));
    }

    public void delete(UUID id, UUID companyId) {
        invoiceService.delete(id, companyId);
    }

    public String getNextInvoiceNumber(UUID companyId) {
        return invoiceService.getNextInvoiceNumber(companyId);
    }

    public InvoiceStatsResponse getStats(UUID companyId) {
        var total = invoiceService.countByCompanyId(companyId);
        var draft = invoiceService.countByCompanyIdAndStatus(companyId, "draft");
        var sent = invoiceService.countByCompanyIdAndStatus(companyId, "sent");
        var paid = invoiceService.countByCompanyIdAndStatus(companyId, "paid");
        var overdue = invoiceService.countByCompanyIdAndStatus(companyId, "overdue");
        var cancelled = invoiceService.countByCompanyIdAndStatus(companyId, "cancelled");
        var totalAmount = nvl(invoiceService.sumTotalTtcByCompanyId(companyId));
        var paidAmount = nvl(invoiceService.sumAmountPaidByCompanyId(companyId));
        var dueAmount = nvl(invoiceService.sumAmountDueByCompanyId(companyId));
        return new InvoiceStatsResponse(total, draft, sent, paid, overdue, cancelled, totalAmount, paidAmount, dueAmount);
    }

    public InvoiceResponse toResponse(Invoice i) {
        return new InvoiceResponse(
                i.getId().toString(),
                i.getInvoiceNumber(),
                i.getQuoteId(),
                i.getPersonId(),
                i.getStatus(),
                i.getTitle(),
                i.getDescription(),
                i.getSubtotalHt(),
                i.getDiscountPercent(),
                i.getDiscountAmount(),
                i.getTotalHt(),
                i.getTotalVat(),
                i.getTotalTtc(),
                i.getAmountPaid(),
                i.getAmountDue(),
                i.getIssueDate(),
                i.getDueDate(),
                i.getPaymentTerms(),
                i.getPaymentMethod(),
                i.getNotes(),
                i.getPaidAt(),
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }

    private Invoice toEntity(UUID companyId, CreateInvoiceRequest req) {
        var i = new Invoice();
        i.setCompanyId(companyId);
        i.setQuoteId(req.quoteId());
        i.setPersonId(req.personId());
        i.setTitle(trim(req.title()));
        i.setDescription(trim(req.description()));
        i.setSubtotalHt(nvl(req.subtotalHt()));
        i.setDiscountPercent(nvl(req.discountPercent()));
        i.setDiscountAmount(nvl(req.discountAmount()));
        i.setTotalHt(nvl(req.totalHt()));
        i.setTotalVat(nvl(req.totalVat()));
        i.setTotalTtc(nvl(req.totalTtc()));
        i.setAmountDue(nvl(req.totalTtc()));
        i.setIssueDate(req.issueDate() != null ? req.issueDate() : java.time.LocalDate.now());
        i.setDueDate(req.dueDate());
        i.setNotes(trim(req.notes()));
        i.setPaymentTerms(trim(req.paymentTerms()));
        i.setStatus("draft");
        return i;
    }

    private void applyUpdate(Invoice i, UpdateInvoiceRequest req) {
        if (req.title() != null) i.setTitle(req.title().trim());
        if (req.description() != null) i.setDescription(req.description().trim());
        if (req.subtotalHt() != null) i.setSubtotalHt(req.subtotalHt());
        if (req.discountPercent() != null) i.setDiscountPercent(req.discountPercent());
        if (req.discountAmount() != null) i.setDiscountAmount(req.discountAmount());
        if (req.totalHt() != null) i.setTotalHt(req.totalHt());
        if (req.totalVat() != null) i.setTotalVat(req.totalVat());
        if (req.totalTtc() != null) i.setTotalTtc(req.totalTtc());
        if (req.issueDate() != null) i.setIssueDate(req.issueDate());
        if (req.dueDate() != null) i.setDueDate(req.dueDate());
        if (req.notes() != null) i.setNotes(req.notes().trim());
        if (req.paymentTerms() != null) i.setPaymentTerms(req.paymentTerms().trim());
        if (req.paymentMethod() != null) i.setPaymentMethod(req.paymentMethod().trim());
        if (req.status() != null) i.setStatus(req.status());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }

    private static BigDecimal nvl(BigDecimal b) {
        return b != null ? b : BigDecimal.ZERO;
    }
}
