package fr.jeroka.billing.service;

import fr.jeroka.billing.entity.BillingInvoiceEntity;
import fr.jeroka.billing.web.dto.invoice.CreateInvoiceRequest;
import fr.jeroka.billing.web.dto.invoice.InvoiceResponse;
import fr.jeroka.billing.web.dto.invoice.UpdateInvoiceRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public final class BillingInvoiceMapper {

    private BillingInvoiceMapper() {}

    public static InvoiceResponse toResponse(BillingInvoiceEntity i) {
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
                i.getUpdatedAt());
    }

    public static BillingInvoiceEntity toNewEntity(UUID companyId, CreateInvoiceRequest req) {
        var i = new BillingInvoiceEntity();
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
        i.setAmountPaid(BigDecimal.ZERO);
        i.setAmountDue(nvl(req.totalTtc()));
        i.setIssueDate(req.issueDate() != null ? req.issueDate() : LocalDate.now());
        i.setDueDate(req.dueDate());
        i.setNotes(trim(req.notes()));
        i.setPaymentTerms(trim(req.paymentTerms()));
        i.setStatus("draft");
        return i;
    }

    public static void applyUpdate(BillingInvoiceEntity i, UpdateInvoiceRequest req) {
        applyInvoiceText(i, req);
        applyInvoiceAmounts(i, req);
        applyInvoiceDatesAndStatus(i, req);
    }

    private static void applyInvoiceText(BillingInvoiceEntity i, UpdateInvoiceRequest req) {
        if (req.title() != null) {
            i.setTitle(req.title().trim());
        }
        if (req.description() != null) {
            i.setDescription(req.description().trim());
        }
        if (req.notes() != null) {
            i.setNotes(req.notes().trim());
        }
        if (req.paymentTerms() != null) {
            i.setPaymentTerms(req.paymentTerms().trim());
        }
        if (req.paymentMethod() != null) {
            i.setPaymentMethod(req.paymentMethod().trim());
        }
    }

    private static void applyInvoiceAmounts(BillingInvoiceEntity i, UpdateInvoiceRequest req) {
        if (req.subtotalHt() != null) {
            i.setSubtotalHt(req.subtotalHt());
        }
        if (req.discountPercent() != null) {
            i.setDiscountPercent(req.discountPercent());
        }
        if (req.discountAmount() != null) {
            i.setDiscountAmount(req.discountAmount());
        }
        if (req.totalHt() != null) {
            i.setTotalHt(req.totalHt());
        }
        if (req.totalVat() != null) {
            i.setTotalVat(req.totalVat());
        }
        if (req.totalTtc() != null) {
            i.setTotalTtc(req.totalTtc());
        }
    }

    private static void applyInvoiceDatesAndStatus(BillingInvoiceEntity i, UpdateInvoiceRequest req) {
        if (req.issueDate() != null) {
            i.setIssueDate(req.issueDate());
        }
        if (req.dueDate() != null) {
            i.setDueDate(req.dueDate());
        }
        if (req.status() != null) {
            i.setStatus(req.status());
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }

    private static BigDecimal nvl(BigDecimal b) {
        return b != null ? b : BigDecimal.ZERO;
    }
}
