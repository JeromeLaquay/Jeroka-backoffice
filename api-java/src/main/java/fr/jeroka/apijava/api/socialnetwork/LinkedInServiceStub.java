package fr.jeroka.apijava.api.socialnetwork;

/**
 * Stub lorsque LinkedIn n'est pas activé. Bean créé par ApiStubsConfig.
 */
public class LinkedInServiceStub implements LinkedInService {

    @Override
    public PublishResult publishPost(Object credentials, PublishContent content) {
        return PublishResult.success("linkedin", "stub-li-" + System.currentTimeMillis(),
                "https://stub.linkedin/post");
    }

    @Override
    public AccountInfo getAccountInfo(Object credentials) {
        return new AccountInfo("stub-li", "Compte Stub LinkedIn", "stub", 0, null, true);
    }

    @Override
    public boolean testConnection(Object credentials) {
        return true;
    }
}
