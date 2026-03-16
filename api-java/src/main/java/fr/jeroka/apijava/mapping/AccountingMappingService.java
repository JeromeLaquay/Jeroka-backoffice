package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.accounting.AccountingTransactionsResponse;
import fr.jeroka.apijava.dto.accounting.FinancialStatsResponse;
import fr.jeroka.apijava.service.AccountingService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AccountingMappingService {

    private final AccountingService accountingService;

    public AccountingMappingService(AccountingService accountingService) {
        this.accountingService = accountingService;
    }

    public FinancialStatsResponse getStats(UUID companyId, String period) {
        return accountingService.getFinancialStats(companyId, period);
    }

    public AccountingTransactionsResponse getRecentTransactions(UUID companyId, int limit) {
        return accountingService.getRecentTransactions(companyId, limit);
    }
}

