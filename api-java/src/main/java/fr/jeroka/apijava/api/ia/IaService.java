package fr.jeroka.apijava.api.ia;

import fr.jeroka.apijava.api.ia.IaConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service IA : délègue au provider configuré (chatgpt ou claude), stub si clé absente.
 */
@Service
public class IaService {

    private static final Logger log = LoggerFactory.getLogger(IaService.class);

    private final Map<String, IaProvider> iaProviders;
    private final IaConfig iaConfig;

    public IaService(Map<String, IaProvider> iaProviders, IaConfig iaConfig) {
        this.iaProviders = iaProviders;
        this.iaConfig = iaConfig;
    }

    private IaProvider currentProvider() {
        String key = iaConfig.provider() != null ? iaConfig.provider().trim().toLowerCase() : "chatgpt";
        IaProvider p = iaProviders.get(key);
        return p != null ? p : iaProviders.get(IaConfig.PROVIDER_CHATGPT);
    }

    public String callOpenAI(String prompt) {
        IaProvider p = currentProvider();
        boolean isStub = p.getClass().getSimpleName().contains("Stub");
        log.info("IA: provider={} ({})", p.name(), isStub ? "stub" : "API");
        return p.callOpenAI(prompt);
    }

    public String callOpenAIImage(String prompt) {
        IaProvider p = currentProvider();
        boolean isStub = p.getClass().getSimpleName().contains("Stub");
        log.info("IA: provider={} ({})", p.name(), isStub ? "stub" : "API");
        return p.callOpenAIImage(prompt);
    }
}
