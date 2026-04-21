package fr.jeroka.billing.web;

import fr.jeroka.billing.security.BillingJwtCompanyId;
import fr.jeroka.billing.service.BillingAccountingService;
import fr.jeroka.billing.web.dto.accounting.AccountingTransactionsResponse;
import fr.jeroka.billing.web.dto.accounting.FinancialStatsResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounting")
public class AccountingApiController {

    private final BillingAccountingService billingAccountingService;

    public AccountingApiController(BillingAccountingService billingAccountingService) {
        this.billingAccountingService = billingAccountingService;
    }

    @GetMapping("/stats")
    public FinancialStatsResponse stats(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "month") String period) {
        return billingAccountingService.financialStats(BillingJwtCompanyId.require(jwt), period);
    }

    @GetMapping("/transactions")
    public AccountingTransactionsResponse transactions(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "10") int limit) {
        return billingAccountingService.recentTransactions(BillingJwtCompanyId.require(jwt), limit);
    }
}
