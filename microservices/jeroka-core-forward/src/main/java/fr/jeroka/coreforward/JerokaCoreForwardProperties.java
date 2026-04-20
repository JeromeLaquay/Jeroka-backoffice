package fr.jeroka.coreforward;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Motifs de chemins à proxifier vers l’API core.
 */
@ConfigurationProperties(prefix = "jeroka.core-forward")
public class JerokaCoreForwardProperties {

    private String coreApiBaseUrl = "http://localhost:3002";

    private List<String> patterns = new ArrayList<>();

    public String getCoreApiBaseUrl() {
        return coreApiBaseUrl;
    }

    public void setCoreApiBaseUrl(String coreApiBaseUrl) {
        this.coreApiBaseUrl = coreApiBaseUrl;
    }

    public List<String> getPatterns() {
        return patterns;
    }

    public void setPatterns(List<String> patterns) {
        this.patterns = patterns;
    }
}
