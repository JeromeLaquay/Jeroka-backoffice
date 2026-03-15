package fr.jeroka.apijava.api.socialnetwork;

public record AccountInfo(
        String id,
        String name,
        String username,
        Integer followers,
        String profilePicture,
        boolean isConnected
) {}
