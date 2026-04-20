package fr.jeroka.auth.jwks;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

/**
 * Émet des JWT d’accès RS256 alignés sur les claims du core.
 */
@Service
public class RsaJwtIssuerService {

    private final JwksKeyService jwksKeyService;
    private final long accessTtlMs;

    public RsaJwtIssuerService(JwksKeyService jwksKeyService,
                               @Value("${JWT_ACCESS_TTL_MS:900000}") long accessTtlMs) {
        this.jwksKeyService = jwksKeyService;
        this.accessTtlMs = accessTtlMs;
    }

    public String issueAccessToken(String sub, String email, String role, String companyId) {
        try {
            RSAKey rsa = jwksKeyService.currentSigningKey();
            RSASSASigner signer = new RSASSASigner(rsa.toPrivateKey());
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(sub)
                    .claim("email", email)
                    .claim("role", role)
                    .claim("companyId", companyId)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusMillis(accessTtlMs)))
                    .build();
            SignedJWT jwt = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256)
                            .keyID(rsa.getKeyID())
                            .type(JOSEObjectType.JWT)
                            .build(),
                    claims);
            jwt.sign(signer);
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Émission JWT RS256 impossible", e);
        }
    }
}
