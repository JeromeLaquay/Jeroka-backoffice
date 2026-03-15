package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.dashboard.DashboardStatsResponse;
import fr.jeroka.apijava.service.DashboardService;
import fr.jeroka.apijava.service.DashboardStats;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Couche mapping Dashboard : Controller -> DashboardMappingService -> DashboardService.
 */
@Service
public class DashboardMappingService {

    private final DashboardService dashboardService;

    public DashboardMappingService(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    public DashboardStatsResponse getStats(UUID companyId) {
        var stats = dashboardService.getStats(companyId);
        return toResponse(companyId, stats);
    }

    private static DashboardStatsResponse toResponse(UUID companyId, DashboardStats stats) {
        return new DashboardStatsResponse(
                companyId.toString(),
                stats.totalClients(),
                stats.totalMessages(),
                stats.totalInvoices(),
                stats.totalQuotes(),
                stats.newClientsMonth(),
                stats.newMessagesWeek(),
                stats.newInvoicesMonth(),
                stats.newQuotesMonth()
        );
    }
}
