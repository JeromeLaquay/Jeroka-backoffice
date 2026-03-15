package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.quote.*;
import fr.jeroka.apijava.entity.Quote;
import fr.jeroka.apijava.service.QuoteService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class QuoteMappingService {

    private final QuoteService quoteService;

    public QuoteMappingService(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    public PageDto<QuoteResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = quoteService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public QuoteResponse getById(UUID id, UUID companyId) {
        return toResponse(quoteService.getByIdAndCompanyId(id, companyId));
    }

    public QuoteResponse create(UUID companyId, CreateQuoteRequest request) {
        var quote = toEntity(companyId, request);
        return toResponse(quoteService.create(quote));
    }

    public QuoteResponse update(UUID id, UUID companyId, UpdateQuoteRequest request) {
        var quote = quoteService.getByIdAndCompanyId(id, companyId);
        applyUpdate(quote, request);
        return toResponse(quoteService.update(quote));
    }

    public void delete(UUID id, UUID companyId) {
        quoteService.delete(id, companyId);
    }

    public String getNextQuoteNumber(UUID companyId) {
        return quoteService.getNextQuoteNumber(companyId);
    }

    public QuoteStatsResponse getStats(UUID companyId) {
        var total = quoteService.countByCompanyId(companyId);
        var draft = quoteService.countByCompanyIdAndStatus(companyId, "draft");
        var sent = quoteService.countByCompanyIdAndStatus(companyId, "sent");
        var accepted = quoteService.countByCompanyIdAndStatus(companyId, "accepted");
        var rejected = quoteService.countByCompanyIdAndStatus(companyId, "rejected");
        var expired = quoteService.countByCompanyIdAndStatus(companyId, "expired");
        return new QuoteStatsResponse(total, draft, sent, accepted, rejected, expired);
    }

    public QuoteResponse toResponse(Quote q) {
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
                q.getUpdatedAt()
        );
    }

    private Quote toEntity(UUID companyId, CreateQuoteRequest req) {
        var q = new Quote();
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

    private void applyUpdate(Quote q, UpdateQuoteRequest req) {
        if (req.title() != null) q.setTitle(req.title().trim());
        if (req.description() != null) q.setDescription(req.description().trim());
        if (req.subtotalHt() != null) q.setSubtotalHt(req.subtotalHt());
        if (req.discountPercent() != null) q.setDiscountPercent(req.discountPercent());
        if (req.discountAmount() != null) q.setDiscountAmount(req.discountAmount());
        if (req.totalHt() != null) q.setTotalHt(req.totalHt());
        if (req.totalVat() != null) q.setTotalVat(req.totalVat());
        if (req.totalTtc() != null) q.setTotalTtc(req.totalTtc());
        if (req.validUntil() != null) q.setValidUntil(req.validUntil());
        if (req.notes() != null) q.setNotes(req.notes().trim());
        if (req.paymentTerms() != null) q.setPaymentTerms(req.paymentTerms().trim());
        if (req.status() != null) q.setStatus(req.status());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }

    private static BigDecimal nvl(BigDecimal b) {
        return b != null ? b : BigDecimal.ZERO;
    }
}
