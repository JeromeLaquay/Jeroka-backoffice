package fr.jeroka.crm.web.dto;

import java.util.UUID;

/**
 * Filtre liste personnes : {@code personType} = colonne {@code type} (client/supplier),
 * {@code typeClient} = particulier/entreprise. Le paramètre query historique {@code type} est résolu ici.
 */
public record PersonListQuery(
        UUID companyId,
        int page,
        int limit,
        String personType,
        String typeClient,
        String status,
        String search) {

    public static PersonListQuery from(
            UUID companyId,
            int page,
            int limit,
            String deprecatedType,
            String personType,
            String typeClient,
            String status,
            String search) {
        String pt = trimToNull(personType);
        String tc = trimToNull(typeClient);
        String dep = trimToNull(deprecatedType);
        if (pt == null && dep != null) {
            if ("supplier".equalsIgnoreCase(dep) || "client".equalsIgnoreCase(dep)) {
                pt = dep.toLowerCase();
            } else if ("individual".equalsIgnoreCase(dep) || "company".equalsIgnoreCase(dep)) {
                tc = dep.toLowerCase();
            }
        }
        if (tc == null && dep != null && ("individual".equalsIgnoreCase(dep) || "company".equalsIgnoreCase(dep))) {
            tc = dep.toLowerCase();
        }
        if (pt == null && tc != null) {
            pt = "client";
        }
        return new PersonListQuery(companyId, page, limit, pt, tc, trimToNull(status), trimToNull(search));
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
