package fr.jeroka.apijava.api.socialnetwork;

/**
 * Contrat publication Twitter (API v2). Implémentation réelle ou stub.
 */
public interface TwitterService extends SocialNetworkProvider {

    @Override
    default String name() {
        return "twitter";
    }
}
