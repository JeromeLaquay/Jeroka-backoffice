package fr.jeroka.apijava.api.socialnetwork;

public record PublishResult(
        boolean success,
        String postId,
        String url,
        String error,
        String platform
) {
    public static PublishResult failure(String platform, String error) {
        return new PublishResult(false, null, null, error, platform);
    }

    public static PublishResult success(String platform, String postId, String url) {
        return new PublishResult(true, postId, url, null, platform);
    }
}
