package fr.jeroka.coreforward;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

/**
 * Enregistre le filtre de forward si {@code jeroka.core-forward.enabled=true}.
 */
@AutoConfiguration
@EnableConfigurationProperties(JerokaCoreForwardProperties.class)
@ConditionalOnProperty(prefix = "jeroka.core-forward", name = "enabled", havingValue = "true")
public class JerokaCoreForwardAutoConfiguration {

    @Bean
    public FilterRegistrationBean<JerokaCoreForwardFilter> jerokaCoreForwardFilter(
            JerokaCoreForwardProperties properties) {
        var reg = new FilterRegistrationBean<>(new JerokaCoreForwardFilter(properties));
        reg.setOrder(Integer.MAX_VALUE - 100);
        return reg;
    }
}
