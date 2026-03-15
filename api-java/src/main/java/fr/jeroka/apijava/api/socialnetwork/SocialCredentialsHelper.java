package fr.jeroka.apijava.api.socialnetwork;

import java.util.Map;

/**
 * Extraction du token (et autres champs) depuis l'objet credentials passé aux providers.
 * Supporte Map avec clés "accessToken", "access_token", "pageId", etc.
 */
public final class SocialCredentialsHelper {

    private SocialCredentialsHelper() {}

    public static String getAccessToken(Object credentials) {
        if (credentials == null) return null;
        String t = get(credentials, "accessToken", null);
        if (t != null) return t;
        return get(credentials, "access_token", null);
    }

    @SuppressWarnings("unchecked")
    public static String get(Object credentials, String key, String defaultValue) {
        if (credentials == null) return defaultValue;
        if (credentials instanceof Map<?, ?> m) {
            Object v = m.get(key);
            return v != null ? v.toString() : defaultValue;
        }
        return defaultValue;
    }
}
