package fr.jeroka.apijava.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;
import java.util.stream.Stream;

@ConfigurationProperties(prefix = "api")
public record ApiProperties(
        String prefix,
        Jwt jwt,
        Cors cors
) {
    public ApiProperties {
        if (prefix == null) prefix = "/api/v1";
        if (jwt == null) jwt = new Jwt(null, 900_000L, 604_800_000L);
        if (cors == null) cors = new Cors(
                List.of("http://localhost:3001"),
                "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                "Content-Type,Authorization,X-Requested-With",
                true
        );
    }

    public record Jwt(String secret, long accessTtlMs, long refreshTtlMs) {
        public Jwt {
            if (accessTtlMs == 0) accessTtlMs = 900_000L;
            if (refreshTtlMs == 0) refreshTtlMs = 604_800_000L;
        }
    }

    public record Cors(
            List<String> allowedOrigins,
            String allowedMethods,
            String allowedHeaders,
            boolean allowCredentials
    ) {
        public Cors {
            // Env CORS_ORIGINS peut être une seule chaîne "a,b,c"
            if (allowedOrigins != null && allowedOrigins.size() == 1) {
                var first = allowedOrigins.getFirst();
                if (first != null && first.contains(",")) {
                    allowedOrigins = Stream.of(first.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .toList();
                }
            }
        }
    }
}
