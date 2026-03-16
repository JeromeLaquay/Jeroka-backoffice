package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.accounting.AccountingTransactionsResponse;
import fr.jeroka.apijava.dto.accounting.FinancialStatsResponse;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.AccountingMappingService;
import fr.jeroka.apijava.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounting")
public class AccountingController {

    private final AccountingMappingService accountingMappingService;

    public AccountingController(AccountingMappingService accountingMappingService) {
        this.accountingMappingService = accountingMappingService;
    }

    @GetMapping("/stats")
    public FinancialStatsResponse stats(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "month") String period) {
        return accountingMappingService.getStats(requireCompanyId(principal.companyId()), period);
    }

    @GetMapping("/transactions")
    public AccountingTransactionsResponse transactions(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "10") int limit) {
        return accountingMappingService.getRecentTransactions(requireCompanyId(principal.companyId()), limit);
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}

