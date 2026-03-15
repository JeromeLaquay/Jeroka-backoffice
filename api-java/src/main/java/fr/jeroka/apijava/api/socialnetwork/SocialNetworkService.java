package fr.jeroka.apijava.api.socialnetwork;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service unifié : publie sur une ou plusieurs plateformes.
 * Les credentials sont résolus par l'appelant (ex. par userId/companyId).
 */
@Service
public class SocialNetworkService {

    private final Map<String, SocialNetworkProvider> providers;

    public SocialNetworkService(List<SocialNetworkProvider> providerList) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(SocialNetworkProvider::name, p -> p));
    }

    public PublishResult publishToPlatform(Object credentials, String platform, PublishContent content) {
        SocialNetworkProvider p = providers.get(platform);
        if (p == null) {
            return PublishResult.failure(platform, "Plateforme " + platform + " non configurée");
        }
        return p.publishPost(credentials, content);
    }

    public List<PublishResult> publishToMultiplePlatforms(Object credentials,
                                                          List<String> platforms, PublishContent content) {
        return platforms.stream()
                .map(platform -> publishToPlatform(credentials, platform, content))
                .toList();
    }

    public boolean testPlatformConnection(Object credentials, String platform) {
        SocialNetworkProvider p = providers.get(platform);
        return p != null && p.testConnection(credentials);
    }

    public AccountInfo getAccountInfo(Object credentials, String platform) {
        SocialNetworkProvider p = providers.get(platform);
        return p != null ? p.getAccountInfo(credentials) : null;
    }

    public List<String> getAvailablePlatforms() {
        return List.copyOf(providers.keySet());
    }
}
