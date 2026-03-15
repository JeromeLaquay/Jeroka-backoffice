package fr.jeroka.apijava.api.socialnetwork;

/**
 * Stub lorsque Twitter n'est pas activé. Bean créé par ApiStubsConfig.
 */
public class TwitterServiceStub implements TwitterService {

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        return PublishResult.success("twitter", "stub-tw-" + System.currentTimeMillis(),
                "https://stub.twitter/post");
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        return new AccountInfo("stub-tw", "Compte Stub Twitter", "stub", 0, null, true);
    }

    @Override
    public boolean testConnection(Object credentials) {
        return true;
    }
}
