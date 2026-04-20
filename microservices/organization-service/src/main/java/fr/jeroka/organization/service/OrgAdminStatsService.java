package fr.jeroka.organization.service;

import fr.jeroka.organization.repository.OrgCompanyRepository;
import fr.jeroka.organization.repository.OrgUserRepository;
import fr.jeroka.organization.web.dto.admin.OrgAdminStatsResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

@Service
public class OrgAdminStatsService {

    private final OrgCompanyRepository companies;
    private final OrgUserRepository users;

    public OrgAdminStatsService(OrgCompanyRepository companies, OrgUserRepository users) {
        this.companies = companies;
        this.users = users;
    }

    public OrgAdminStatsResponse getStats() {
        Instant now = Instant.now();
        Instant startOfMonth =
                now.atZone(ZoneOffset.UTC).truncatedTo(ChronoUnit.DAYS).withDayOfMonth(1).toInstant();
        long totalCompanies = companies.count();
        long totalUsers = users.count();
        long activeUsers = users.countByActiveTrue();
        long newCompanies = companies.countByCreatedAtAfter(startOfMonth);
        long newUsers = users.countByCreatedAtAfter(startOfMonth);
        var sub = new OrgAdminStatsResponse.SubscriptionStats(
                countPlan("free"), countPlan("basic"), countPlan("premium"), countPlan("enterprise"));
        return new OrgAdminStatsResponse(
                totalCompanies, totalCompanies, totalUsers, activeUsers, newCompanies, newUsers, sub);
    }

    private long countPlan(String plan) {
        try {
            return companies.countBySubscriptionPlan(plan);
        } catch (Exception e) {
            return 0L;
        }
    }
}
