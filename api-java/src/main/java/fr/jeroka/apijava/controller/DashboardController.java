package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.dashboard.DashboardStatsResponse;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.DashboardMappingService;
import fr.jeroka.apijava.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardMappingService dashboardMappingService;

    public DashboardController(DashboardMappingService dashboardMappingService) {
        this.dashboardMappingService = dashboardMappingService;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse stats(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        var companyId = principal.companyId();
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return dashboardMappingService.getStats(UUID.fromString(companyId));
    }
}
