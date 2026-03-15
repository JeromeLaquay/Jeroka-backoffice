package fr.jeroka.apijava.api.socialnetwork;

/**
 * Stub lorsque Facebook n'est pas activé. Bean créé par ApiStubsConfig.
 */
public class FacebookServiceStub implements FacebookService {

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        return PublishResult.success("facebook", "stub-fb-" + System.currentTimeMillis(),
                "https://stub.facebook/post");
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        return new AccountInfo("stub-fb", "Compte Stub Facebook", "stub", 0, null, true);
    }

    @Override
    public boolean testConnection(Object credentials) {
        return true;
    }
}
