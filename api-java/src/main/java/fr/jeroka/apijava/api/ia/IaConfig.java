package fr.jeroka.apijava.api.ia;

public record IaConfig(String provider) {
    public static final String PROVIDER_CHATGPT = "chatgpt";
    public static final String PROVIDER_CLAUDE = "claude";
    public static final String PROVIDER_LOCAL = "local";
}
