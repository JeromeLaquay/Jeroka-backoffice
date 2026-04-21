package fr.jeroka.billing.web;

import fr.jeroka.billing.security.BillingJwtCompanyId;
import fr.jeroka.billing.service.BillingQuoteService;
import fr.jeroka.billing.web.dto.PageDto;
import fr.jeroka.billing.web.dto.quote.CreateQuoteRequest;
import fr.jeroka.billing.web.dto.quote.QuoteResponse;
import fr.jeroka.billing.web.dto.quote.QuoteStatsResponse;
import fr.jeroka.billing.web.dto.quote.UpdateQuoteRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotes")
public class QuotesApiController {

    private final BillingQuoteService billingQuoteService;

    public QuotesApiController(BillingQuoteService billingQuoteService) {
        this.billingQuoteService = billingQuoteService;
    }

    @GetMapping
    public PageDto<QuoteResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return billingQuoteService.list(BillingJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/stats")
    public QuoteStatsResponse stats(@AuthenticationPrincipal Jwt jwt) {
        return billingQuoteService.stats(BillingJwtCompanyId.require(jwt));
    }

    @GetMapping("/next-number")
    public Map<String, String> nextNumber(@AuthenticationPrincipal Jwt jwt) {
        var num = billingQuoteService.nextQuoteNumber(BillingJwtCompanyId.require(jwt));
        return Map.of("quoteNumber", num);
    }

    @GetMapping("/{id}")
    public QuoteResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return billingQuoteService.getById(id, BillingJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateQuoteRequest body) {
        return billingQuoteService.create(BillingJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public QuoteResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuoteRequest body) {
        return billingQuoteService.update(id, BillingJwtCompanyId.require(jwt), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        billingQuoteService.delete(id, BillingJwtCompanyId.require(jwt));
    }
}
