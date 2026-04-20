package fr.jeroka.dashboard.web;

import fr.jeroka.dashboard.security.DashboardJwtCompanyId;
import fr.jeroka.dashboard.service.DashboardAggregationService;
import fr.jeroka.dashboard.web.dto.DashboardStatsResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardApiController {

    private final DashboardAggregationService dashboardAggregationService;

    public DashboardApiController(DashboardAggregationService dashboardAggregationService) {
        this.dashboardAggregationService = dashboardAggregationService;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse stats(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        return dashboardAggregationService.aggregateStats(authorization, DashboardJwtCompanyId.require(jwt));
    }
}
