package fr.jeroka.jwt.resource;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Vrai si {@code jeroka.auth.jwks-url} est renseigné (évite un JwtDecoder vide).
 */
public class JerokaJwksUrlConfigured implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String v = context.getEnvironment().getProperty("jeroka.auth.jwks-url");
        return v != null && !v.isBlank();
    }
}
