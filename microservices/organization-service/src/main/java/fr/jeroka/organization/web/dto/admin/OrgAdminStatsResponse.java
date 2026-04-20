package fr.jeroka.organization.web.dto.admin;

/** Statistiques admin (aligné monolithe / front). */
public record OrgAdminStatsResponse(
        long total_companies,
        long active_companies,
        long total_users,
        long active_users,
        long new_companies_this_month,
        long new_users_this_month,
        SubscriptionStats subscription_stats) {

    public record SubscriptionStats(long free, long basic, long premium, long enterprise) {}
}
