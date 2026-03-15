package fr.jeroka.apijava.api.ia;

/**
 * Contrat pour le service Claude (Anthropic). Implémentation réelle via API Anthropic ou stub.
 */
public interface ClaudeService extends IaProvider {

    @Override
    default String name() {
        return "claude";
    }

    /**
     * Appel chat Claude (texte).
     */
    String callClaude(String prompt);

    @Override
    default String callOpenAI(String prompt) {
        return callClaude(prompt);
    }

    @Override
    default String callOpenAIImage(String prompt) {
        return "https://via.placeholder.com/1024x1024?text=Claude+ne+genere+pas+images";
    }
}
