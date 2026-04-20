package fr.jeroka.billing.service;

import fr.jeroka.billing.entity.BillingQuoteEntity;
import fr.jeroka.billing.exception.BillingApiException;
import fr.jeroka.billing.repository.BillingQuoteRepository;
import fr.jeroka.billing.web.dto.PageDto;
import fr.jeroka.billing.web.dto.quote.CreateQuoteRequest;
import fr.jeroka.billing.web.dto.quote.QuoteResponse;
import fr.jeroka.billing.web.dto.quote.QuoteStatsResponse;
import fr.jeroka.billing.web.dto.quote.UpdateQuoteRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class BillingQuoteService {

    private final BillingQuoteRepository quotes;

    public BillingQuoteService(BillingQuoteRepository quotes) {
        this.quotes = quotes;
    }

    @Transactional(readOnly = true)
    public PageDto<QuoteResponse> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = quotes.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
        var items = result.getContent().stream().map(BillingQuoteMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public QuoteResponse getById(UUID id, UUID companyId) {
        return BillingQuoteMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public QuoteResponse create(UUID companyId, CreateQuoteRequest req) {
        var q = BillingQuoteMapper.toNewEntity(companyId, req);
        if (q.getQuoteNumber() == null || q.getQuoteNumber().isBlank()) {
            q.setQuoteNumber(nextQuoteNumber(companyId));
        }
        return BillingQuoteMapper.toResponse(quotes.save(q));
    }

    @Transactional
    public QuoteResponse update(UUID id, UUID companyId, UpdateQuoteRequest req) {
        BillingQuoteEntity q = loadOwned(id, companyId);
        BillingQuoteMapper.applyUpdate(q, req);
        return BillingQuoteMapper.toResponse(quotes.save(q));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        quotes.deleteById(id);
    }

    @Transactional(readOnly = true)
    public String nextQuoteNumber(UUID companyId) {
        return nextQuoteNumberInternal(companyId);
    }

    @Transactional(readOnly = true)
    public QuoteStatsResponse stats(UUID companyId) {
        Instant startOfMonth =
                YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        long createdThisMonth = quotes.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        return new QuoteStatsResponse(
                quotes.countByCompanyId(companyId),
                quotes.countByCompanyIdAndStatus(companyId, "draft"),
                quotes.countByCompanyIdAndStatus(companyId, "sent"),
                quotes.countByCompanyIdAndStatus(companyId, "accepted"),
                quotes.countByCompanyIdAndStatus(companyId, "rejected"),
                quotes.countByCompanyIdAndStatus(companyId, "expired"),
                createdThisMonth);
    }

    private BillingQuoteEntity loadOwned(UUID id, UUID companyId) {
        return quotes
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BillingApiException("Devis introuvable", HttpStatus.NOT_FOUND));
    }

    private String nextQuoteNumberInternal(UUID companyId) {
        return quotes
                .findFirstByCompanyIdOrderByQuoteNumberDesc(companyId)
                .map(q -> incrementDev(q.getQuoteNumber()))
                .orElse("DEV-001");
    }

    private static String incrementDev(String last) {
        if (last == null || !last.contains("-")) {
            return "DEV-001";
        }
        try {
            int num = Integer.parseInt(last.substring(last.lastIndexOf('-') + 1));
            return last.substring(0, last.lastIndexOf('-') + 1) + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "DEV-001";
        }
    }
}
