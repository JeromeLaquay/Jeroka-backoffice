package fr.jeroka.jwt.resource;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Expose un {@link JwtDecoder} lorsque {@code jeroka.auth.jwks-url} est défini et non vide.
 */
@AutoConfiguration
@EnableConfigurationProperties(JerokaJwtProperties.class)
@ConditionalOnClass(JwtDecoder.class)
@Conditional(JerokaJwksUrlConfigured.class)
public class JerokaJwtResourceServerAutoConfiguration {

    @Bean
    public JwtDecoder jerokaAuthJwtDecoder(JerokaJwtProperties properties) {
        return NimbusJwtDecoder.withJwkSetUri(properties.getJwksUrl()).build();
    }
}
