package fr.jeroka.organization.web.dto.user;

public record OrgUserStatsResponse(
        long total, long active, long inactive, long admins, long users, long newThisMonth) {}
