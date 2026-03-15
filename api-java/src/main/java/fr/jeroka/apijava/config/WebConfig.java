package fr.jeroka.apijava.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
import java.util.stream.Stream;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ApiProperties apiProperties;

    public WebConfig(ApiProperties apiProperties) {
        this.apiProperties = apiProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var cors = apiProperties.cors();
        registry.addMapping("/api/**")
                .allowedOrigins(cors.allowedOrigins().toArray(String[]::new))
                .allowedMethods(cors.allowedMethods().split(","))
                .allowedHeaders(cors.allowedHeaders().split(","))
                .allowCredentials(cors.allowCredentials());
    }

    /**
     * Source CORS pour Spring Security : les réponses 401/403 incluent les en-têtes CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var cors = apiProperties.cors();
        var config = new CorsConfiguration();
        config.setAllowedOrigins(cors.allowedOrigins());
        config.setAllowedMethods(Stream.of(cors.allowedMethods().split(",")).map(String::trim).toList());
        config.setAllowedHeaders(Stream.of(cors.allowedHeaders().split(",")).map(String::trim).toList());
        config.setAllowCredentials(cors.allowCredentials());
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
