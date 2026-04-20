package fr.jeroka.emailservice.api.google;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.stream.StreamSupport;

/**
 * IntÃ©gration Gmail via l'API REST v1 (OAuth2 refresh_token).
 */
@Service
@ConditionalOnProperty(name = "app.google.mail.stub", havingValue = "false", matchIfMissing = true)
public class GoogleMailGmailApiService implements GoogleMailService {

    private static final Logger log = LoggerFactory.getLogger(GoogleMailGmailApiService.class);
    private static final String GMAIL_V1 = "https://gmail.googleapis.com/gmail/v1";
    private static final String META = "format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date";

    private final ObjectMapper objectMapper;
    private final RestClient http = RestClient.create();

    public GoogleMailGmailApiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<GmailMessageSimple> getRecentEmails(GoogleOAuthCredentials credentials,
                                                    Instant since, int maxResults) {
        String token = requireAccessToken(credentials);
        int cap = Math.min(500, Math.max(1, maxResults));
        List<String> ids = listNewestMessageIds(token, cap);
        List<GmailMessageSimple> fetched = fetchMessagesInParallel(token, ids);
        List<GmailMessageSimple> filtered = filterBySince(fetched, since);
        if (!fetched.isEmpty() && filtered.isEmpty()) {
            log.warn("Aucun message aprÃ¨s filtre date depuis {} â€” utilisation des {} dernier(s) reÃ§u(s)",
                    since, fetched.size());
            return fetched;
        }
        return filtered;
    }

    @Override
    public byte[] getAttachmentData(GoogleOAuthCredentials credentials, String messageId, String attachmentId) {
        String token = requireAccessToken(credentials);
        String uri = GMAIL_V1 + "/users/me/messages/" + messageId + "/attachments/" + attachmentId;
        try {
            String body = http.get().uri(uri).header(HttpHeaders.AUTHORIZATION, bearer(token))
                    .retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(body);
            String data = root.path("data").asText(null);
            if (data == null || data.isBlank()) {
                return new byte[0];
            }
            return Base64.getUrlDecoder().decode(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.warn("PiÃ¨ce jointe Gmail introuvable: messageId={} attachmentId={}", messageId, attachmentId, e);
            return new byte[0];
        }
    }

    @Override
    public List<GmailLabel> getUserLabels(GoogleOAuthCredentials credentials) {
        String token = requireAccessToken(credentials);
        try {
            String body = http.get().uri(GMAIL_V1 + "/users/me/labels").header(HttpHeaders.AUTHORIZATION, bearer(token))
                    .retrieve().body(String.class);
            return parseLabels(body);
        } catch (RestClientResponseException e) {
            logGmailHttpError("labels.list", e);
            return List.of();
        } catch (Exception e) {
            log.error("labels.list Gmail", e);
            return List.of();
        }
    }

    @Override
    public String createLabel(GoogleOAuthCredentials credentials, String labelName) {
        String token = requireAccessToken(credentials);
        String json = "{\"name\":\"" + escapeJson(labelName) + "\",\"labelListVisibility\":\"labelShow\","
                + "\"messageListVisibility\":\"show\"}";
        String body = http.post().uri(GMAIL_V1 + "/users/me/labels")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .body(json)
                .retrieve()
                .body(String.class);
        try {
            return objectMapper.readTree(body).path("id").asText();
        } catch (Exception e) {
            throw new IllegalStateException("RÃ©ponse crÃ©ation libellÃ© invalide", e);
        }
    }

    @Override
    public void renameLabel(GoogleOAuthCredentials credentials, String labelId, String newLabelName) {
        String token = requireAccessToken(credentials);
        String json = "{\"name\":\"" + escapeJson(newLabelName) + "\"}";
        http.patch().uri(GMAIL_V1 + "/users/me/labels/" + labelId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .body(json)
                .retrieve()
                .toBodilessEntity();
    }

    @Override
    public void deleteLabel(GoogleOAuthCredentials credentials, String labelId) {
        String token = requireAccessToken(credentials);
        http.delete().uri(GMAIL_V1 + "/users/me/labels/" + labelId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .retrieve()
                .toBodilessEntity();
    }

    private List<GmailMessageSimple> fetchMessagesInParallel(String token, List<String> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            return ids.stream()
                    .map(id -> CompletableFuture.supplyAsync(() -> fetchOneMessage(token, id), executor))
                    .map(CompletableFuture::join)
                    .filter(Objects::nonNull)
                    .toList();
        }
    }

    private GmailMessageSimple fetchOneMessage(String token, String id) {
        String uri = GMAIL_V1 + "/users/me/messages/" + id + "?" + META;
        try {
            String body = http.get().uri(uri).header(HttpHeaders.AUTHORIZATION, bearer(token))
                    .retrieve().body(String.class);
            return parseMessage(body);
        } catch (Exception e) {
            log.warn("Lecture message Gmail id={} ignorÃ©e", id, e);
            return null;
        }
    }

    /**
     * Derniers messages (ordre dÃ©croissant cÃ´tÃ© Gmail), sans {@code q} pour Ã©viter des listes vides.
     */
    private List<String> listNewestMessageIds(String token, int maxResults) {
        String uri = GMAIL_V1 + "/users/me/messages?maxResults=" + maxResults;
        try {
            String body = http.get().uri(uri).header(HttpHeaders.AUTHORIZATION, bearer(token))
                    .retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(body);
            JsonNode messages = root.path("messages");
            if (!messages.isArray()) {
                return List.of();
            }
            List<String> ids = new ArrayList<>();
            for (JsonNode m : messages) {
                ids.add(m.path("id").asText());
            }
            return ids;
        } catch (RestClientResponseException e) {
            logGmailHttpError("messages.list", e);
            return List.of();
        } catch (Exception e) {
            log.error("messages.list Gmail", e);
            return List.of();
        }
    }

    private static List<GmailMessageSimple> filterBySince(List<GmailMessageSimple> messages, Instant since) {
        if (since == null) {
            return messages;
        }
        long minMs = since.toEpochMilli();
        return messages.stream().filter(m -> messageInternalMs(m) >= minMs).toList();
    }

    private static long messageInternalMs(GmailMessageSimple m) {
        if (m.internalDate() == null) {
            return 0L;
        }
        try {
            return Long.parseLong(m.internalDate().trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private List<GmailLabel> parseLabels(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode labels = root.path("labels");
        if (!labels.isArray()) {
            return List.of();
        }
        List<GmailLabel> out = new ArrayList<>();
        for (JsonNode l : labels) {
            if (!"user".equalsIgnoreCase(l.path("type").asText())) {
                continue;
            }
            out.add(new GmailLabel(l.path("id").asText(), l.path("name").asText(), "user"));
        }
        log.debug("LibellÃ©s Gmail personnalisÃ©s : {}", out.size());
        return out;
    }

    private GmailMessageSimple parseMessage(String body) throws Exception {
        JsonNode root = objectMapper.readTree(body);
        JsonNode payload = root.path("payload");
        String from = headerFromPayload(payload);
        String subject = firstHeader(payload, "Subject");
        String date = firstHeader(payload, "Date");
        List<String> labelIds = collectLabelIds(root);
        String internalDate = root.path("internalDate").asText(null);
        long size = root.path("sizeEstimate").asLong(0L);
        return new GmailMessageSimple(
                root.path("id").asText(),
                subject,
                from,
                null,
                null,
                null,
                date,
                root.path("snippet").asText(null),
                internalDate,
                size > 0 ? size : null,
                List.of(),
                null,
                null,
                null,
                labelIds
        );
    }

    private static List<String> collectLabelIds(JsonNode root) {
        JsonNode arr = root.path("labelIds");
        if (!arr.isArray()) {
            return List.of();
        }
        return StreamSupport.stream(arr.spliterator(), false).map(JsonNode::asText).toList();
    }

    private static String firstHeader(JsonNode payload, String headerName) {
        String v = headerValue(payload, headerName);
        if (v != null && !v.isBlank()) {
            return v;
        }
        return scanPartsForHeader(payload.path("parts"), headerName);
    }

    private static String headerFromPayload(JsonNode payload) {
        return firstHeader(payload, "From");
    }

    private static String headerValue(JsonNode partOrPayload, String headerName) {
        JsonNode headers = partOrPayload.path("headers");
        if (!headers.isArray()) {
            return null;
        }
        for (JsonNode h : headers) {
            if (headerName.equalsIgnoreCase(h.path("name").asText())) {
                return h.path("value").asText(null);
            }
        }
        return null;
    }

    private static String scanPartsForHeader(JsonNode parts, String headerName) {
        if (!parts.isArray()) {
            return null;
        }
        for (JsonNode part : parts) {
            String v = headerValue(part, headerName);
            if (v != null && !v.isBlank()) {
                return v;
            }
            String nested = scanPartsForHeader(part.path("parts"), headerName);
            if (nested != null && !nested.isBlank()) {
                return nested;
            }
        }
        return null;
    }

    private static String requireAccessToken(GoogleOAuthCredentials credentials) {
        String token = GoogleTokenRefresh.refreshAccessToken(credentials);
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Impossible d'obtenir un access_token Google pour Gmail");
        }
        return token;
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private static String escapeJson(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void logGmailHttpError(String op, RestClientResponseException e) {
        log.error("Gmail {} HTTP {} : {}", op, e.getStatusCode().value(), e.getResponseBodyAsString());
    }
}
