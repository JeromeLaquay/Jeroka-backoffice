package fr.jeroka.billing.service;

import fr.jeroka.billing.entity.BillingQuoteEntity;
import fr.jeroka.billing.web.dto.quote.CreateQuoteRequest;
import fr.jeroka.billing.web.dto.quote.QuoteResponse;
import fr.jeroka.billing.web.dto.quote.UpdateQuoteRequest;

import java.math.BigDecimal;
import java.util.UUID;

public final class BillingQuoteMapper {

    private BillingQuoteMapper() {}

    public static QuoteResponse toResponse(BillingQuoteEntity q) {
        return new QuoteResponse(
                q.getId().toString(),
                q.getQuoteNumber(),
                q.getPersonId(),
                q.getStatus(),
                q.getTitle(),
                q.getDescription(),
                q.getSubtotalHt(),
                q.getDiscountPercent(),
                q.getDiscountAmount(),
                q.getTotalHt(),
                q.getTotalVat(),
                q.getTotalTtc(),
                q.getValidUntil(),
                q.getNotes(),
                q.getPaymentTerms(),
                q.getCreatedAt(),
                q.getUpdatedAt());
    }

    public static BillingQuoteEntity toNewEntity(UUID companyId, CreateQuoteRequest req) {
        var q = new BillingQuoteEntity();
        q.setCompanyId(companyId);
        q.setPersonId(req.personId());
        q.setTitle(trim(req.title()));
        q.setDescription(trim(req.description()));
        q.setSubtotalHt(nvl(req.subtotalHt()));
        q.setDiscountPercent(nvl(req.discountPercent()));
        q.setDiscountAmount(nvl(req.discountAmount()));
        q.setTotalHt(nvl(req.totalHt()));
        q.setTotalVat(nvl(req.totalVat()));
        q.setTotalTtc(nvl(req.totalTtc()));
        q.setValidUntil(req.validUntil());
        q.setNotes(trim(req.notes()));
        q.setPaymentTerms(trim(req.paymentTerms()));
        q.setStatus("draft");
        return q;
    }

    public static void applyUpdate(BillingQuoteEntity q, UpdateQuoteRequest req) {
        applyQuoteText(q, req);
        applyQuoteAmounts(q, req);
        applyQuoteDatesAndStatus(q, req);
    }

    private static void applyQuoteText(BillingQuoteEntity q, UpdateQuoteRequest req) {
        if (req.title() != null) {
            q.setTitle(req.title().trim());
        }
        if (req.description() != null) {
            q.setDescription(req.description().trim());
        }
        if (req.notes() != null) {
            q.setNotes(req.notes().trim());
        }
        if (req.paymentTerms() != null) {
            q.setPaymentTerms(req.paymentTerms().trim());
        }
    }

    private static void applyQuoteAmounts(BillingQuoteEntity q, UpdateQuoteRequest req) {
        if (req.subtotalHt() != null) {
            q.setSubtotalHt(req.subtotalHt());
        }
        if (req.discountPercent() != null) {
            q.setDiscountPercent(req.discountPercent());
        }
        if (req.discountAmount() != null) {
            q.setDiscountAmount(req.discountAmount());
        }
        if (req.totalHt() != null) {
            q.setTotalHt(req.totalHt());
        }
        if (req.totalVat() != null) {
            q.setTotalVat(req.totalVat());
        }
        if (req.totalTtc() != null) {
            q.setTotalTtc(req.totalTtc());
        }
    }

    private static void applyQuoteDatesAndStatus(BillingQuoteEntity q, UpdateQuoteRequest req) {
        if (req.validUntil() != null) {
            q.setValidUntil(req.validUntil());
        }
        if (req.status() != null) {
            q.setStatus(req.status());
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }

    private static BigDecimal nvl(BigDecimal b) {
        return b != null ? b : BigDecimal.ZERO;
    }
}
