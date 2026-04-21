package fr.jeroka.crm.service;

import fr.jeroka.crm.entity.CrmMessageEntity;
import fr.jeroka.crm.web.dto.MessageAiDraftResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Brouillon de réponse IA (stub si clé absente).
 */
@Service
public class CrmMessageAiService {

    private final String apiKey;

    public CrmMessageAiService(@Value("${OPENAI_API_KEY:}") String apiKey) {
        this.apiKey = apiKey != null ? apiKey : "";
    }

    public MessageAiDraftResponseDto draft(CrmMessageEntity message, Map<String, String> options) {
        String tone = toneFrom(options);
        if (apiKey.isBlank()) {
            return new MessageAiDraftResponseDto(stubWithoutApiKey(message, tone));
        }
        return new MessageAiDraftResponseDto("(OpenAI non branché dans crm-service : intégration à prévoir.)");
    }

    private static String toneFrom(Map<String, String> options) {
        if (options == null || options.get("tone") == null) {
            return "professionnel";
        }
        return options.get("tone");
    }

    private static String stubWithoutApiKey(CrmMessageEntity message, String tone) {
        return "Bonjour,\n\nMerci pour votre message concernant « "
                + message.getSubject()
                + " ». Nous revenons vers vous rapidement.\n\n(Ton demandé : "
                + tone
                + ". Brouillon automatique : définir OPENAI_API_KEY sur crm-service pour une proposition IA.)";
    }
}

