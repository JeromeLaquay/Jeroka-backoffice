package fr.jeroka.auth.jwks;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import fr.jeroka.auth.entity.AuthSigningKeyEntity;
import fr.jeroka.auth.repository.AuthSigningKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.UUID;

/**
 * Clés RSA persistées (JWKS prod-ready, rotation possible via statut).
 */
@Service
public class JwksKeyService {

    private static final Logger log = LoggerFactory.getLogger(JwksKeyService.class);
    public static final String STATUS_ACTIVE = "ACTIVE";

    private final AuthSigningKeyRepository repository;
    private volatile RSAKey rsaKey;
    private volatile JWKSet jwkSet;

    public JwksKeyService(AuthSigningKeyRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void loadOrCreateActiveKey() {
        var row = repository.findFirstByStatusOrderByCreatedAtDesc(STATUS_ACTIVE);
        if (row.isPresent()) {
            activateFromEntity(row.get());
            return;
        }
        RSAKey generated = generateNewRsa();
        persistNew(generated);
        activateFromKey(generated);
        log.info("JWKS: nouvelle clé RSA persistée kid={}", generated.getKeyID());
    }

    private void activateFromEntity(AuthSigningKeyEntity e) {
        try {
            JWK jwk = JWK.parseFromPEMEncodedObjects(e.getPrivatePem());
            if (!(jwk instanceof RSAKey parsed)) {
                throw new IllegalStateException("Clé PEM attendue de type RSA, reçu: " + jwk.getKeyType());
            }
            activateFromKey(parsed);
            log.info("JWKS: clé chargée depuis la base kid={}", parsed.getKeyID());
        } catch (Exception ex) {
            throw new IllegalStateException("Clé auth illisible en base", ex);
        }
    }

    private void activateFromKey(RSAKey key) {
        this.rsaKey = key;
        this.jwkSet = new JWKSet(key.toPublicJWK());
    }

    private void persistNew(RSAKey generated) {
        try {
            AuthSigningKeyEntity e = new AuthSigningKeyEntity();
            e.setKid(generated.getKeyID());
            e.setPrivatePem(toPrivatePkcs8Pem(generated));
            e.setPublicPem(toPublicSpkiPem(generated));
            e.setStatus(STATUS_ACTIVE);
            repository.save(e);
        } catch (Exception ex) {
            throw new IllegalStateException("Persistance clé RSA impossible", ex);
        }
    }

    public String jwksJson() {
        return jwkSet.toJSONObject().toString();
    }

    public String currentKid() {
        return rsaKey.getKeyID();
    }

    public RSAKey currentSigningKey() {
        return rsaKey;
    }

    private static RSAKey generateNewRsa() {
        try {
            return new RSAKeyGenerator(2048)
                    .keyUse(KeyUse.SIGNATURE)
                    .keyID(UUID.randomUUID().toString())
                    .generate();
        } catch (Exception e) {
            throw new IllegalStateException("Génération RSA impossible", e);
        }
    }

    private static String toPrivatePkcs8Pem(RSAKey rsa) throws Exception {
        byte[] der = rsa.toRSAPrivateKey().getEncoded();
        return wrapPem("PRIVATE KEY", der);
    }

    private static String toPublicSpkiPem(RSAKey rsa) throws Exception {
        byte[] der = rsa.toRSAPublicKey().getEncoded();
        return wrapPem("PUBLIC KEY", der);
    }

    private static String wrapPem(String type, byte[] der) {
        String b64 = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(der);
        return "-----BEGIN " + type + "-----\n" + b64 + "\n-----END " + type + "-----\n";
    }
}
