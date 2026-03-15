package fr.jeroka.apijava.api.ia;

import java.util.concurrent.CompletableFuture;

/**
 * Contrat pour le service OpenAI (chat completions + génération d'images).
 * Implémentation réelle via API OpenAI (ou stub).
 */
public interface ChatgptService extends IaProvider {

    @Override
    default String name() {
        return "chatgpt";
    }

    @Override
    String callOpenAI(String prompt);

    @Override
    String callOpenAIImage(String prompt);
}
