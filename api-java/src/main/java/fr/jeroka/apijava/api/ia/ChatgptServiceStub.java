package fr.jeroka.apijava.api.ia;

/**
 * Implémentation stub lorsque OpenAI n'est pas configuré. Bean créé par ApiStubsConfig.
 */
public class ChatgptServiceStub implements ChatgptService {

    private static final String STUB_TEXT = "Réponse stub IA (OpenAI non configuré).";
    private static final String STUB_IMAGE_URL = "https://via.placeholder.com/1024x1024?text=Stub+Image";

    @Override
    public String callOpenAI(String prompt) {
        return STUB_TEXT;
    }

    @Override
    public String callOpenAIImage(String prompt) {
        return STUB_IMAGE_URL;
    }
}
