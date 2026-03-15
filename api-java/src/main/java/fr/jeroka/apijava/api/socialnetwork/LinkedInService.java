package fr.jeroka.apijava.api.socialnetwork;

/**
 * Contrat publication LinkedIn. Implémentation réelle ou stub.
 */
public interface LinkedInService extends SocialNetworkProvider {

    @Override
    default String name() {
        return "linkedin";
    }
}
