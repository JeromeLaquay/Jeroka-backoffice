package fr.jeroka.apijava.api.socialnetwork;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Implémentation réelle : appels HTTP à l'API Twitter v2 (tweets).
 * Utilise un Bearer Token (OAuth 2.0). Activée lorsque {@code app.social.twitter.enabled=true}.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.social.twitter.enabled', 'false') == 'true'")
public class TwitterServiceAPI implements TwitterService {

    private static final Logger log = LoggerFactory.getLogger(TwitterServiceAPI.class);
    private static final String BASE_URL = "https://api.twitter.com/2";

    private final RestClient restClient = RestClient.builder().build();

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank()) {
            return PublishResult.failure("twitter", "Token d'accès manquant");
        }
        String text = buildText(content);
        if (text.length() > 280) text = text.substring(0, 277) + "...";
        Map<String, Object> body = Map.of("text", text);
        try {
            Map<?, ?> res = restClient.post()
                    .uri(BASE_URL + "/tweets")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            Object data = res != null ? res.get("data") : null;
            Object id = data instanceof Map<?, ?> m ? m.get("id") : null;
            return id != null
                    ? PublishResult.success("twitter", id.toString(), "https://twitter.com/user/status/" + id)
                    : PublishResult.failure("twitter", "Réponse invalide");
        } catch (Exception e) {
            log.warn("Twitter publish error: {}", e.getMessage());
            return PublishResult.failure("twitter", e.getMessage());
        }
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank()) return null;
        try {
            Map<?, ?> res = restClient.get()
                    .uri(BASE_URL + "/users/me?user.fields=public_metrics,profile_image_url")
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(Map.class);
            if (res == null) return null;
            Object data = res.get("data");
            if (!(data instanceof Map<?, ?> u)) return null;
            Object metrics = u.get("public_metrics");
            Integer followers = null;
            if (metrics instanceof Map<?, ?> m && m.get("followers_count") != null) {
                followers = ((Number) m.get("followers_count")).intValue();
            }
            return new AccountInfo(
                    String.valueOf(u.get("id")),
                    String.valueOf(u.get("name")),
                    String.valueOf(u.get("username")),
                    followers,
                    String.valueOf(u.get("profile_image_url")),
                    true);
        } catch (Exception e) {
            log.warn("Twitter getAccountInfo error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean testConnection(Object credentials) {
        return getAccountInfo(credentials) != null;
    }

    private static String buildText(PublishContent content) {
        String text = content.text() != null ? content.text() : "";
        if (content.hashtags() != null && !content.hashtags().isEmpty()) {
            String tags = String.join(" ", content.hashtags().stream()
                    .map(tag -> tag.startsWith("#") ? tag : "#" + tag)
                    .toList());
            text += "\n\n" + tags;
        }
        if (content.linkUrl() != null && !content.linkUrl().isBlank()) text += "\n\n" + content.linkUrl();
        return text;
    }
}
