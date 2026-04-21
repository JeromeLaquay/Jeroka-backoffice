package fr.jeroka.jwt.resource;

/**
 * Principal aligné sur les claims du core (sub, email, role, companyId).
 */
public record JerokaUserPrincipal(String id, String email, String role, String companyId) {}
