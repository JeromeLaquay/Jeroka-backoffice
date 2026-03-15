package fr.jeroka.apijava.api.socialnetwork;

/**
 * Contrat pour une plateforme (Facebook, Twitter, LinkedIn).
 * credentials : objet résolu par l'appelant (ex. depuis BDD par company/platform).
 */
public interface SocialNetworkProvider {

    String name();

    PublishResult publishPost(Object credentials, PublishContent content);

    AccountInfo getAccountInfo(Object credentials);

    boolean testConnection(Object credentials);
}
