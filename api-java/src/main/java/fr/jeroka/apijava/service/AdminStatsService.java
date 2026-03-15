package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.admin.AdminStatsResponse;
import fr.jeroka.apijava.dto.admin.AdminStatsResponse.SubscriptionStats;
import fr.jeroka.apijava.repository.CompanyRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

@Service
public class AdminStatsService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public AdminStatsService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public AdminStatsResponse getStats() {
        var now = Instant.now();
        var startOfMonth = now.atZone(ZoneOffset.UTC).truncatedTo(ChronoUnit.DAYS)
                .withDayOfMonth(1).toInstant();

        long totalCompanies = companyRepository.count();
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long newCompaniesThisMonth = companyRepository.countByCreatedAtAfter(startOfMonth);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);

        long free = countByPlan("free");
        long basic = countByPlan("basic");
        long premium = countByPlan("premium");
        long enterprise = countByPlan("enterprise");

        return new AdminStatsResponse(
                totalCompanies,
                totalCompanies,
                totalUsers,
                activeUsers,
                newCompaniesThisMonth,
                newUsersThisMonth,
                new SubscriptionStats(free, basic, premium, enterprise)
        );
    }

    private long countByPlan(String plan) {
        try {
            return companyRepository.countBySubscriptionPlan(plan);
        } catch (Exception e) {
            return 0L;
        }
    }
}
