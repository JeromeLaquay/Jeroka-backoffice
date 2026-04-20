package fr.jeroka.auth.jwks;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Charge ou crée la clé RSA au démarrage (transaction JPA correcte).
 */
@Component
@Order(0)
public class JwksBootstrap implements ApplicationRunner {

    private final JwksKeyService jwksKeyService;

    public JwksBootstrap(JwksKeyService jwksKeyService) {
        this.jwksKeyService = jwksKeyService;
    }

    @Override
    public void run(ApplicationArguments args) {
        jwksKeyService.loadOrCreateActiveKey();
    }
}
