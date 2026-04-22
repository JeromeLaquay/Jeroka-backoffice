package fr.jeroka.docs.drive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GoogleDriveExplorerService {

    private static final String DRIVE_BASE_URL = "https://www.googleapis.com/drive/v3";

    private final RestClient http = RestClient.create();
    private final ObjectMapper objectMapper;
    private final OrganizationGoogleOAuthClient oAuthClient;

    public GoogleDriveExplorerService(ObjectMapper objectMapper, OrganizationGoogleOAuthClient oAuthClient) {
        this.objectMapper = objectMapper;
        this.oAuthClient = oAuthClient;
    }

    public List<Map<String, Object>> listChildren(UUID userId, String parentId) {
        String token = accessTokenFor(userId);
        List<Map<String, Object>> allItems = new ArrayList<>();
        String nextPageToken = null;
        int guard = 0;
        do {
            String uri = buildListUri(parentId, nextPageToken);
            String body = http.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(String.class);
            DriveListResponse response = parseListResponse(body);
            allItems.addAll(response.items());
            nextPageToken = response.nextPageToken();
            guard++;
        } while (nextPageToken != null && !nextPageToken.isBlank() && guard < 20);
        return allItems;
    }

    public Map<String, Object> getItem(UUID userId, String itemId) {
        try {
            String token = accessTokenFor(userId);
            String body = http.get()
                    .uri(buildItemUri(itemId))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(String.class);
            return parseFileNode(objectMapper.readTree(body));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Réponse Google Drive invalide", e);
        }
    }

    private String accessTokenFor(UUID userId) {
        GoogleOAuthCredentials credentials = oAuthClient.getCredentials(userId)
                .orElseThrow(() -> new IllegalArgumentException("Connexion Google non configurée"));
        String token = GoogleTokenRefresh.refreshAccessToken(credentials);
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Impossible de récupérer un access_token Google");
        }
        return token;
    }

    private String buildListUri(String parentId, String pageToken) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(DRIVE_BASE_URL + "/files")
                .queryParam("orderBy", "folder,name")
                .queryParam("pageSize", 200)
                .queryParam("supportsAllDrives", true)
                .queryParam("includeItemsFromAllDrives", true)
                .queryParam("fields", "nextPageToken,files(id,name,mimeType,parents,webViewLink)");
        String parent = normalizeParent(parentId);
        if (parent != null) {
            builder.queryParam("q", "'" + parent + "' in parents and trashed = false");
        }
        if (pageToken != null && !pageToken.isBlank()) {
            builder.queryParam("pageToken", pageToken);
        }
        return builder.build().toUriString();
    }

    private String buildItemUri(String itemId) {
        return UriComponentsBuilder.fromHttpUrl(DRIVE_BASE_URL + "/files/{itemId}")
                .queryParam("supportsAllDrives", true)
                .queryParam("fields", "id,name,mimeType,parents,webViewLink")
                .buildAndExpand(itemId)
                .toUriString();
    }

    private DriveListResponse parseListResponse(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode files = root.path("files");
            if (!files.isArray()) {
                return new DriveListResponse(List.of(), "");
            }
            List<Map<String, Object>> result = new ArrayList<>();
            for (JsonNode node : files) {
                result.add(parseFileNode(node));
            }
            String nextPageToken = root.path("nextPageToken").asText("");
            return new DriveListResponse(result, nextPageToken);
        } catch (Exception e) {
            throw new IllegalStateException("Réponse Google Drive invalide", e);
        }
    }

    private Map<String, Object> parseFileNode(JsonNode node) {
        String mimeType = node.path("mimeType").asText("");
        String type = "application/vnd.google-apps.folder".equals(mimeType) ? "folder" : "file";
        List<String> parents = new ArrayList<>();
        JsonNode parentNodes = node.path("parents");
        if (parentNodes.isArray()) {
            parentNodes.forEach(parent -> parents.add(parent.asText("")));
        }
        return Map.of(
                "id", node.path("id").asText(""),
                "name", node.path("name").asText(""),
                "mimeType", mimeType,
                "type", type,
                "parents", parents,
                "webViewLink", node.path("webViewLink").asText(""));
    }

    private String normalizeParent(String parentId) {
        if (parentId == null || parentId.isBlank()) {
            return "root";
        }
        String trimmed = parentId.trim();
        if ("root".equalsIgnoreCase(trimmed)) {
            return "root";
        }
        return trimmed;
    }

    private record DriveListResponse(List<Map<String, Object>> items, String nextPageToken) {}
}
