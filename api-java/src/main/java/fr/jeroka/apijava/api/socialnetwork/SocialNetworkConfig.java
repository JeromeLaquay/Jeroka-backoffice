package fr.jeroka.apijava.api.socialnetwork;

/**
 * Configuration par plateforme (Facebook, LinkedIn, Twitter).
 * Les credentials réels sont résolus ailleurs (ex. par company/user).
 */
public record SocialNetworkConfig(
        FacebookConfig facebook,
        LinkedInConfig linkedin,
        TwitterConfig twitter
) {
    public record FacebookConfig(String appId, String appSecret, String accessToken, String pageId) {}
    public record LinkedInConfig(String clientId, String clientSecret, String accessToken, String organizationId) {}
    public record TwitterConfig(String apiKey, String apiSecret, String accessToken, String accessTokenSecret) {}
}
