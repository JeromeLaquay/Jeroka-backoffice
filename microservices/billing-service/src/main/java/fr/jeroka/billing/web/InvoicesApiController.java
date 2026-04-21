package fr.jeroka.billing.web;

import fr.jeroka.billing.security.BillingJwtCompanyId;
import fr.jeroka.billing.service.BillingInvoiceService;
import fr.jeroka.billing.web.dto.PageDto;
import fr.jeroka.billing.web.dto.invoice.CreateInvoiceRequest;
import fr.jeroka.billing.web.dto.invoice.InvoiceDashboardAnalyticsResponse;
import fr.jeroka.billing.web.dto.invoice.InvoiceResponse;
import fr.jeroka.billing.web.dto.invoice.InvoiceStatsResponse;
import fr.jeroka.billing.web.dto.invoice.UpdateInvoiceRequest;
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

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoicesApiController {

    private final BillingInvoiceService billingInvoiceService;

    public InvoicesApiController(BillingInvoiceService billingInvoiceService) {
        this.billingInvoiceService = billingInvoiceService;
    }

    @GetMapping
    public PageDto<InvoiceResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return billingInvoiceService.list(BillingJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/stats")
    public InvoiceStatsResponse stats(@AuthenticationPrincipal Jwt jwt) {
        return billingInvoiceService.stats(BillingJwtCompanyId.require(jwt));
    }

    @GetMapping("/analytics")
    public InvoiceDashboardAnalyticsResponse analytics(@AuthenticationPrincipal Jwt jwt) {
        return billingInvoiceService.dashboardAnalytics(BillingJwtCompanyId.require(jwt));
    }

    @GetMapping("/next-number")
    public Map<String, String> nextNumber(@AuthenticationPrincipal Jwt jwt) {
        var num = billingInvoiceService.nextInvoiceNumber(BillingJwtCompanyId.require(jwt));
        return Map.of("invoiceNumber", num);
    }

    @GetMapping("/{id}")
    public InvoiceResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return billingInvoiceService.getById(id, BillingJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateInvoiceRequest body) {
        return billingInvoiceService.create(BillingJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public InvoiceResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInvoiceRequest body) {
        return billingInvoiceService.update(id, BillingJwtCompanyId.require(jwt), body);
    }

    @PostMapping("/{id}/mark-paid")
    public InvoiceResponse markPaid(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, BigDecimal> body) {
        var amount = body != null && body.containsKey("amount") ? body.get("amount") : null;
        return billingInvoiceService.markPaid(id, BillingJwtCompanyId.require(jwt), amount);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        billingInvoiceService.delete(id, BillingJwtCompanyId.require(jwt));
    }
}
