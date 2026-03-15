package fr.jeroka.apijava.api;

import fr.jeroka.apijava.api.ia.ChatgptService;
import fr.jeroka.apijava.api.ia.ClaudeService;
import fr.jeroka.apijava.api.ia.IaConfig;
import fr.jeroka.apijava.api.ia.IaProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Configuration des modules api (IA, etc.). Enregistre les providers IA (ChatGPT, Claude).
 */
@Configuration
public class IaApiConfig {

    @Value("${app.ia.provider:chatgpt}")
    private String iaProvider;

    @Bean
    public IaConfig iaConfig() {
        return new IaConfig(iaProvider);
    }

    @Bean
    public Map<String, IaProvider> iaProviders(ChatgptService chatgptService, ClaudeService claudeService) {
        return Map.of(
                IaConfig.PROVIDER_CHATGPT, (IaProvider) chatgptService,
                IaConfig.PROVIDER_CLAUDE, (IaProvider) claudeService
        );
    }
}
