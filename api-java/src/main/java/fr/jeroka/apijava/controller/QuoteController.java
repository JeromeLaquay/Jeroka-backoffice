package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.quote.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.QuoteMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotes")
public class QuoteController {

    private final QuoteMappingService quoteMappingService;

    public QuoteController(QuoteMappingService quoteMappingService) {
        this.quoteMappingService = quoteMappingService;
    }

    @GetMapping
    public PageDto<QuoteResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var companyId = requireCompanyId(principal.companyId());
        return quoteMappingService.listByCompany(companyId, page, limit);
    }

    @GetMapping("/stats")
    public QuoteStatsResponse stats(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return quoteMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/next-number")
    public Map<String, String> nextNumber(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        var num = quoteMappingService.getNextQuoteNumber(requireCompanyId(principal.companyId()));
        return Map.of("quoteNumber", num);
    }

    @GetMapping("/{id}")
    public QuoteResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return quoteMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateQuoteRequest request) {
        return quoteMappingService.create(requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}")
    public QuoteResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuoteRequest request) {
        return quoteMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        quoteMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
