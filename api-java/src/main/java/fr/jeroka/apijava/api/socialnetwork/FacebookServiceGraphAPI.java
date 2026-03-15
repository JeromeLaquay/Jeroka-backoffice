package fr.jeroka.apijava.api.socialnetwork;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implémentation réelle : appels HTTP à l'API Facebook Graph (publication sur une page).
 * Activée lorsque {@code app.social.facebook.enabled=true}.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.social.facebook.enabled', 'false') == 'true'")
public class FacebookServiceGraphAPI implements FacebookService {

    private static final Logger log = LoggerFactory.getLogger(FacebookServiceGraphAPI.class);
    private static final String BASE_URL = "https://graph.facebook.com/v18.0";

    private final RestClient restClient = RestClient.builder().build();

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank()) {
            return PublishResult.failure("facebook", "Token d'accès manquant");
        }
        String pageId = SocialCredentialsHelper.get(credentials, "pageId", "me");
        String message = buildMessage(content);
        try {
            String uri = BASE_URL + "/" + pageId + "/feed?message=" + encode(message) + "&access_token=" + encode(token);
            if (content.linkUrl() != null && !content.linkUrl().isBlank()) uri += "&link=" + encode(content.linkUrl());
            Map<?, ?> res = restClient.post()
                    .uri(uri)
                    .retrieve()
                    .body(Map.class);
            Object id = res != null ? res.get("id") : null;
            return id != null
                    ? PublishResult.success("facebook", id.toString(), "https://facebook.com/" + id)
                    : PublishResult.failure("facebook", "Réponse invalide");
        } catch (Exception e) {
            log.warn("Facebook publish error: {}", e.getMessage());
            return PublishResult.failure("facebook", e.getMessage());
        }
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank()) return null;
        try {
            String uri = BASE_URL + "/me?fields=id,name&access_token=" + encode(token);
            Map<?, ?> res = restClient.get().uri(uri).retrieve().body(Map.class);
            if (res == null) return null;
            return new AccountInfo(
                    String.valueOf(res.get("id")),
                    String.valueOf(res.get("name")),
                    null, null, null, true);
        } catch (Exception e) {
            log.warn("Facebook getAccountInfo error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean testConnection(Object credentials) {
        return getAccountInfo(credentials) != null;
    }

    private static String buildMessage(PublishContent content) {
        String text = content.text() != null ? content.text() : "";
        if (content.hashtags() != null && !content.hashtags().isEmpty()) {
            String tags = content.hashtags().stream()
                    .map(tag -> tag.startsWith("#") ? tag : "#" + tag)
                    .collect(Collectors.joining(" "));
            text += "\n\n" + tags;
        }
        return text;
    }

    private static String encode(String s) {
        return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
    }
}
