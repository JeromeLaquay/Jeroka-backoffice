package fr.jeroka.apijava.config;

import fr.jeroka.apijava.api.google.GoogleDriveService;
import fr.jeroka.apijava.api.google.GoogleDriveServiceStub;
import fr.jeroka.apijava.api.google.calendar.GoogleCalendarService;
import fr.jeroka.apijava.api.google.calendar.GoogleCalendarServiceStub;
import fr.jeroka.apijava.api.ia.ChatgptService;
import fr.jeroka.apijava.api.ia.ChatgptServiceStub;
import fr.jeroka.apijava.api.ia.ClaudeService;
import fr.jeroka.apijava.api.ia.ClaudeServiceStub;
import fr.jeroka.apijava.api.ia.DocumentIAService;
import fr.jeroka.apijava.api.ia.DocumentIAServiceStub;
import fr.jeroka.apijava.api.socialnetwork.FacebookService;
import fr.jeroka.apijava.api.socialnetwork.FacebookServiceStub;
import fr.jeroka.apijava.api.socialnetwork.LinkedInService;
import fr.jeroka.apijava.api.socialnetwork.LinkedInServiceStub;
import fr.jeroka.apijava.api.socialnetwork.TwitterService;
import fr.jeroka.apijava.api.socialnetwork.TwitterServiceStub;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Définit les beans stub (Drive, Calendar, IA, réseaux). Gmail : {@code GoogleMailServiceStub}
 * si {@code app.google.mail.stub=true}, sinon {@code GoogleMailGmailApiService}.
 * Garantit leur création depuis le package config pour éviter les erreurs d'ordre de chargement.
 */
@Configuration
public class ApiStubsConfig {

    private static final Logger log = LoggerFactory.getLogger(ApiStubsConfig.class);

    @Bean
    @ConditionalOnMissingBean(GoogleDriveService.class)
    public GoogleDriveService googleDriveService() {
        return new GoogleDriveServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(GoogleCalendarService.class)
    public GoogleCalendarService googleCalendarService() {
        return new GoogleCalendarServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(DocumentIAService.class)
    public DocumentIAService documentIAService() {
        return new DocumentIAServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(ChatgptService.class)
    public ChatgptService chatgptService() {
        log.info("IA (OpenAI): stub actif — définir OPENAI_API_KEY ou APP_IA_OPENAI_API_KEY pour activer l'API OpenAI");
        return new ChatgptServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(ClaudeService.class)
    public ClaudeService claudeService() {
        log.info("IA (Claude): stub actif — définir ANTHROPIC_API_KEY ou APP_IA_ANTHROPIC_API_KEY pour activer l'API Anthropic");
        return new ClaudeServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(FacebookService.class)
    public FacebookService facebookService() {
        return new FacebookServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(LinkedInService.class)
    public LinkedInService linkedInService() {
        return new LinkedInServiceStub();
    }

    @Bean
    @ConditionalOnMissingBean(TwitterService.class)
    public TwitterService twitterService() {
        return new TwitterServiceStub();
    }
}
