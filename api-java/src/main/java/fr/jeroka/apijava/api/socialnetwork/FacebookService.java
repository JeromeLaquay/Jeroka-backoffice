package fr.jeroka.apijava.api.socialnetwork;

/**
 * Contrat publication Facebook (API Graph). Implémentation réelle ou stub.
 */
public interface FacebookService extends SocialNetworkProvider {

    @Override
    default String name() {
        return "facebook";
    }
}
