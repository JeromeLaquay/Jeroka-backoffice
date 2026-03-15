package fr.jeroka.apijava.security;

import fr.jeroka.apijava.config.ApiProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey accessKey;
    private final long accessTtlMs;

    public JwtService(ApiProperties apiProperties) {
        var jwt = apiProperties.jwt();
        this.accessKey = Keys.hmacShaKeyFor(jwt.secret().getBytes(StandardCharsets.UTF_8));
        this.accessTtlMs = jwt.accessTtlMs();
    }

    public String generateAccessToken(String userId, String email, String role, String companyId) {
        var now = new Date();
        var expiry = new Date(now.getTime() + accessTtlMs);
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .claim("companyId", companyId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(accessKey)
                .compact();
    }

    public UserPrincipal validateAndGetPrincipal(String token) {
        try {
            var payload = Jwts.parser()
                    .verifyWith(accessKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return new UserPrincipal(
                    payload.getSubject(),
                    payload.get("email", String.class),
                    payload.get("role", String.class),
                    payload.get("companyId", String.class));
        } catch (Exception e) {
            return null;
        }
    }

    public record UserPrincipal(String id, String email, String role, String companyId) {}
}
