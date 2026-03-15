package fr.jeroka.apijava.dto.admin;

/**
 * Statistiques admin (aligné frontend AdminStats).
 */
public record AdminStatsResponse(
        long total_companies,
        long active_companies,
        long total_users,
        long active_users,
        long new_companies_this_month,
        long new_users_this_month,
        SubscriptionStats subscription_stats
) {
    public record SubscriptionStats(long free, long basic, long premium, long enterprise) {}
}
