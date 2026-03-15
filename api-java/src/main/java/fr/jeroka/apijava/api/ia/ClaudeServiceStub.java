package fr.jeroka.apijava.api.ia;

/**
 * Implémentation stub lorsque Anthropic n'est pas configuré. Bean créé par ApiStubsConfig.
 */
public class ClaudeServiceStub implements ClaudeService {

    private static final String STUB_TEXT = "Réponse stub IA (Claude / Anthropic non configuré).";

    @Override
    public String callClaude(String prompt) {
        return STUB_TEXT;
    }
}
