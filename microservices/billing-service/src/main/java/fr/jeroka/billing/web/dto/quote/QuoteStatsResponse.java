package fr.jeroka.billing.web.dto.quote;

/** Statistiques devis ; {@code createdThisMonth} = créations depuis le 1er du mois (UTC). */
public record QuoteStatsResponse(
        long total,
        long draft,
        long sent,
        long accepted,
        long rejected,
        long expired,
        long createdThisMonth) {}
