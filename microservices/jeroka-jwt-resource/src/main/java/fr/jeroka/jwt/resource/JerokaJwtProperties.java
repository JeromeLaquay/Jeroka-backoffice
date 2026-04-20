package fr.jeroka.jwt.resource;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriétés pour consommer les JWT émis par auth-service (JWKS).
 */
@ConfigurationProperties(prefix = "jeroka.auth")
public class JerokaJwtProperties {

    /** URL JWKS (ex. http://auth-service:3004/.well-known/jwks.json). */
    private String jwksUrl = "";

    public String getJwksUrl() {
        return jwksUrl;
    }

    public void setJwksUrl(String jwksUrl) {
        this.jwksUrl = jwksUrl;
    }
}
