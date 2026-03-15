package fr.jeroka.apijava.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserInfo user
) {
    public static final String TOKEN_TYPE = "Bearer";

    public record UserInfo(
            String id,
            String email,
            String firstName,
            String lastName,
            String role,
            String companyId
    ) {}
}
