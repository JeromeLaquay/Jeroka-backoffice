package fr.jeroka.apijava.api.socialnetwork;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.stream.Collectors;

@Component
@ConditionalOnExpression("environment.getProperty('app.social.linkedin.enabled', 'false') == 'true'")
public class LinkedInServiceAPI implements LinkedInService {

    private static final Logger log = LoggerFactory.getLogger(LinkedInServiceAPI.class);
    private static final String BASE_URL = "https://api.linkedin.com/v2";

    private final RestClient restClient = RestClient.builder().build();

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank())
            return PublishResult.failure("linkedin", "Token d'accès manquant");
        String text = content.text() != null ? content.text() : "";
        if (content.hashtags() != null && !content.hashtags().isEmpty())
            text += "\n\n" + content.hashtags().stream().map(tag -> tag.startsWith("#") ? tag : "#" + tag).collect(Collectors.joining(" "));
        Map<String, Object> body = Map.of(
                "author", "urn:li:person:" + SocialCredentialsHelper.get(credentials, "personUrn", "me"),
                "lifecycleState", "PUBLISHED",
                "specificContent", Map.of("com.linkedin.ugc.ShareContent", Map.of("shareCommentary", Map.of("text", text), "shareMediaCategory", "NONE")),
                "visibility", Map.of("com.linkedin.ugc.MemberNetworkVisibility", "PUBLIC"));
        try {
            Map<?, ?> res = restClient.post()
                    .uri(BASE_URL + "/ugcPosts")
                    .header("Authorization", "Bearer " + token)
                    .header("X-Restli-Protocol-Version", "2.0.0")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            Object id = res != null ? res.get("id") : null;
            return id != null ? PublishResult.success("linkedin", id.toString(), "https://linkedin.com/feed/update/" + id) : PublishResult.failure("linkedin", "Réponse invalide");
        } catch (Exception e) {
            log.warn("LinkedIn publish error: {}", e.getMessage());
            return PublishResult.failure("linkedin", e.getMessage());
        }
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        String token = SocialCredentialsHelper.getAccessToken(credentials);
        if (token == null || token.isBlank()) return null;
        try {
            Map<?, ?> res = restClient.get().uri(BASE_URL + "/me").header("Authorization", "Bearer " + token).retrieve().body(Map.class);
            if (res == null) return null;
            return new AccountInfo(String.valueOf(res.get("id")), String.valueOf(res.get("localizedFirstName")), null, null, null, true);
        } catch (Exception e) {
            log.warn("LinkedIn getAccountInfo error: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public boolean testConnection(Object credentials) {
        return getAccountInfo(credentials) != null;
    }
}
