package fr.jeroka.apijava.api.ia;

/**
 * Contrat pour un fournisseur IA (OpenAI, Claude, etc.).
 */
public interface IaProvider {

    String name();

    String callOpenAI(String prompt);

    String callOpenAIImage(String prompt);
}
