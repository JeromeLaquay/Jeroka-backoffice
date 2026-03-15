package fr.jeroka.apijava.api.ia;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Implémentation réelle : appels HTTP à l'API Anthropic (Messages).
 * Activée lorsque {@code app.ia.anthropic-api-key} est défini.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.ia.anthropic-api-key', '').length() > 0")
public class ClaudeServiceAnthropic implements ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeServiceAnthropic.class);
    private static final String MESSAGES_URL = "https://api.anthropic.com/v1/messages";
    private static final String VERSION = "2023-06-01";
    /** Modèle par défaut : Sonnet 4.6 (ancien claude-3-5-sonnet-20241022 obsolète). */
    private static final String DEFAULT_MODEL = "claude-sonnet-4-6";

    private final RestClient restClient;
    private final String model;

    public ClaudeServiceAnthropic(
            @Value("${app.ia.anthropic-api-key}") String apiKey,
            @Value("${app.ia.claude-model:claude-sonnet-4-6}") String model) {
        String key = apiKey != null ? apiKey.trim() : "";
        this.model = (model != null && !model.isBlank()) ? model.trim() : DEFAULT_MODEL;
        log.info("IA (Claude): API Anthropic activée, modèle={}", this.model);
        this.restClient = RestClient.builder()
                .defaultHeader("x-api-key", key)
                .defaultHeader("anthropic-version", VERSION)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String callClaude(String prompt) {
        if (prompt == null || prompt.isBlank()) return "";
        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 1024,
                "system", "Tu es un assistant IA professionnel.",
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );
        try {
            Map<?, ?> res = restClient.post()
                    .uri(MESSAGES_URL)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return extractText(res);
        } catch (Exception e) {
            log.warn("Claude API error: {}", e.getMessage());
            throw new RuntimeException("Erreur appel Claude: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private static String extractText(Map<?, ?> res) {
        List<?> content = (List<?>) res.get("content");
        if (content == null || content.isEmpty()) return "";
        for (Object block : content) {
            if (!(block instanceof Map)) continue;
            Map<?, ?> m = (Map<?, ?>) block;
            if ("text".equals(m.get("type"))) {
                Object text = m.get("text");
                return text != null ? text.toString().trim() : "";
            }
        }
        return "";
    }
}
