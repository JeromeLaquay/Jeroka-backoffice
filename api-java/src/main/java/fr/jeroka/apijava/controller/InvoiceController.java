package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.invoice.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.InvoiceMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceMappingService invoiceMappingService;

    public InvoiceController(InvoiceMappingService invoiceMappingService) {
        this.invoiceMappingService = invoiceMappingService;
    }

    @GetMapping
    public PageDto<InvoiceResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var companyId = requireCompanyId(principal.companyId());
        return invoiceMappingService.listByCompany(companyId, page, limit);
    }

    @GetMapping("/stats")
    public InvoiceStatsResponse stats(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return invoiceMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/next-number")
    public Map<String, String> nextNumber(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        var num = invoiceMappingService.getNextInvoiceNumber(requireCompanyId(principal.companyId()));
        return Map.of("invoiceNumber", num);
    }

    @GetMapping("/{id}")
    public InvoiceResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return invoiceMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateInvoiceRequest request) {
        return invoiceMappingService.create(requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}")
    public InvoiceResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInvoiceRequest request) {
        return invoiceMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @PostMapping("/{id}/mark-paid")
    public InvoiceResponse markPaid(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, BigDecimal> body) {
        var amount = body != null && body.containsKey("amount") ? body.get("amount") : null;
        return invoiceMappingService.markPaid(id, requireCompanyId(principal.companyId()), amount);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        invoiceMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
