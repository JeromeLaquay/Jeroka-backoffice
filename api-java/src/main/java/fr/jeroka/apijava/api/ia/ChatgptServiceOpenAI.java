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
 * Implémentation réelle : appels HTTP à l'API OpenAI (chat completions + images).
 * Activée lorsque {@code app.ia.openai-api-key} est défini.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.ia.openai-api-key', '').length() > 0")
public class ChatgptServiceOpenAI implements ChatgptService {

    private static final Logger log = LoggerFactory.getLogger(ChatgptServiceOpenAI.class);
    private static final String CHAT_URL = "https://api.openai.com/v1/chat/completions";
    private static final String IMAGES_URL = "https://api.openai.com/v1/images/generations";
    private static final String MODEL_CHAT = "gpt-3.5-turbo";
    private static final String MODEL_IMAGE = "dall-e-3";

    private final RestClient restClient;
    private final String apiKey;

    public ChatgptServiceOpenAI(@Value("${app.ia.openai-api-key}") String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        log.info("IA (OpenAI): API activée (clé configurée)");
        this.restClient = RestClient.builder()
                .defaultHeader("Authorization", "Bearer " + this.apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String callOpenAI(String prompt) {
        if (prompt == null || prompt.isBlank()) return "";
        Map<String, Object> body = Map.of(
                "model", MODEL_CHAT,
                "messages", List.of(
                        Map.of("role", "system", "content", "Tu es un assistant IA professionnel."),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 1000,
                "temperature", 0.7
        );
        try {
            Map<?, ?> res = restClient.post()
                    .uri(CHAT_URL)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return extractChatContent(res);
        } catch (Exception e) {
            log.warn("OpenAI chat error: {}", e.getMessage());
            throw new RuntimeException("Erreur appel OpenAI: " + e.getMessage(), e);
        }
    }

    @Override
    public String callOpenAIImage(String prompt) {
        if (prompt == null || prompt.isBlank()) return "";
        Map<String, Object> body = Map.of(
                "model", MODEL_IMAGE,
                "prompt", prompt,
                "n", 1,
                "size", "1024x1024",
                "quality", "standard"
        );
        try {
            Map<?, ?> res = restClient.post()
                    .uri(IMAGES_URL)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return extractImageUrl(res);
        } catch (Exception e) {
            log.warn("OpenAI image error: {}", e.getMessage());
            throw new RuntimeException("Erreur génération image OpenAI: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private static String extractChatContent(Map<?, ?> res) {
        List<?> choices = (List<?>) res.get("choices");
        if (choices == null || choices.isEmpty()) return "";
        Object first = choices.get(0);
        if (!(first instanceof Map)) return "";
        Object message = ((Map<?, ?>) first).get("message");
        if (!(message instanceof Map)) return "";
        Object content = ((Map<?, ?>) message).get("content");
        return content != null ? content.toString().trim() : "";
    }

    @SuppressWarnings("unchecked")
    private static String extractImageUrl(Map<?, ?> res) {
        List<?> data = (List<?>) res.get("data");
        if (data == null || data.isEmpty()) return "";
        Object first = data.get(0);
        if (!(first instanceof Map)) return "";
        Object url = ((Map<?, ?>) first).get("url");
        return url != null ? url.toString() : "";
    }
}
