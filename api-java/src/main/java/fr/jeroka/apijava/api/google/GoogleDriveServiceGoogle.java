package fr.jeroka.apijava.api.google;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implémentation réelle : appels HTTP à l'API Google Drive v3 (token OAuth2 + REST).
 * Activée lorsque {@code app.google.client-id} et {@code app.google.refresh-token} sont définis.
 */
@Component
@ConditionalOnExpression("environment.getProperty('app.google.drive.enabled', 'false') == 'true'")
public class GoogleDriveServiceGoogle implements GoogleDriveService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveServiceGoogle.class);
    private static final String BASE = "https://www.googleapis.com/drive/v3/files";

    private RestClient restClient(String token) {
        return RestClient.builder().defaultHeader("Authorization", "Bearer " + token).build();
    }

    @Override
    public List<DriveFileSummary> listAllFilesAndFoldersInFolder(GoogleOAuthCredentials credentials, String folderId, int pageSize) {
        String token = resolveToken(credentials);
        if (token == null) return List.of();
        String q = "'" + folderId + "' in parents and trashed=false";
        String uri = UriComponentsBuilder.fromHttpUrl(BASE)
                .queryParam("q", q)
                .queryParam("pageSize", pageSize)
                .queryParam("fields", "files(id,name,mimeType,webViewLink)")
                .build()
                .toUriString();
        Map<?, ?> res = restClient(token).get().uri(uri).retrieve().body(Map.class);
        List<DriveFileSummary> out = new ArrayList<>();
        for (Object f : listFiles(res)) {
            out.add(toSummary((Map<?, ?>) f, credentials, token, pageSize));
        }
        return out;
    }

    @Override
    public List<DriveFileSummary> listDirectChildren(GoogleOAuthCredentials credentials, String folderId, int pageSize) {
        String token = resolveToken(credentials);
        if (token == null) return List.of();
        String q = "'" + folderId + "' in parents and trashed=false";
        String uri = UriComponentsBuilder.fromHttpUrl(BASE)
                .queryParam("q", q)
                .queryParam("pageSize", pageSize)
                .queryParam("fields", "files(id,name,mimeType,webViewLink)")
                .build()
                .toUriString();
        Map<?, ?> res = restClient(token).get().uri(uri).retrieve().body(Map.class);
        List<DriveFileSummary> out = new ArrayList<>();
        for (Object f : listFiles(res)) {
            out.add(toSummaryFlat((Map<?, ?>) f));
        }
        return out;
    }

    @Override
    public boolean downloadFile(GoogleOAuthCredentials credentials, String fileId, String destinationPath) {
        byte[] data = getFileBytes(credentials, fileId);
        if (data == null) return false;
        try {
            Files.write(Path.of(destinationPath), data);
            return true;
        } catch (Exception e) {
            log.warn("Drive downloadFile error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public DriveFileSummary getFile(GoogleOAuthCredentials credentials, String fileId) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        Map<?, ?> res = restClient(token).get().uri(BASE + "/" + fileId + "?fields=id,name,mimeType,webViewLink").retrieve().body(Map.class);
        return res != null ? toSummaryFlat(res) : null;
    }

    @Override
    public DriveFileSummary createFile(GoogleOAuthCredentials credentials, CreateFileRequest request) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        Map<String, Object> meta = Map.of("name", request.name(), "mimeType", request.mimeType(), "parents", List.of(request.parentFolderId() != null ? request.parentFolderId() : "root"));
        Map<?, ?> created = restClient(token).post().uri(BASE + "?fields=id,name,mimeType,webViewLink").contentType(MediaType.APPLICATION_JSON).body(meta).retrieve().body(Map.class);
        if (created == null) return null;
        if (request.contentBuffer() != null && request.contentBuffer().length > 0) {
            uploadMedia(token, created.get("id").toString(), request.mimeType(), request.contentBuffer());
        }
        return toSummaryFlat(created);
    }

    @Override
    public boolean deleteFile(GoogleOAuthCredentials credentials, String fileId) {
        String token = resolveToken(credentials);
        if (token == null) return false;
        try {
            restClient(token).delete().uri(BASE + "/" + fileId).retrieve().toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.warn("Drive deleteFile error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public FileStreamResult getFileStream(GoogleOAuthCredentials credentials, String fileId) {
        DriveFileSummary f = getFile(credentials, fileId);
        byte[] data = getFileBytes(credentials, fileId);
        if (data == null) return null;
        return new FileStreamResult(new ByteArrayInputStream(data), f != null ? f.mimeType() : null, f != null ? f.name() : null);
    }

    private String resolveToken(GoogleOAuthCredentials c) {
        if (c == null) return null;
        if (c.accessToken() != null && !c.accessToken().isBlank()) return c.accessToken();
        return GoogleTokenRefresh.refreshAccessToken(c);
    }

    @SuppressWarnings("unchecked")
    private List<?> listFiles(Map<?, ?> res) {
        Object files = res != null ? res.get("files") : null;
        return files instanceof List ? (List<?>) files : List.of();
    }

    private DriveFileSummary toSummary(Map<?, ?> f, GoogleOAuthCredentials credentials, String token, int pageSize) {
        String id = String.valueOf(f.get("id"));
        String mime = String.valueOf(f.get("mimeType"));
        boolean folder = "application/vnd.google-apps.folder".equals(mime);
        List<DriveFileSummary> children = folder ? listAllFilesAndFoldersInFolder(credentials, id, pageSize) : null;
        return new DriveFileSummary(id, String.valueOf(f.get("name")), mime, folder ? DriveFileSummary.TYPE_FOLDER : DriveFileSummary.TYPE_FILE, String.valueOf(f.get("webViewLink")), children);
    }

    private DriveFileSummary toSummaryFlat(Map<?, ?> f) {
        String mime = String.valueOf(f.get("mimeType"));
        boolean folder = "application/vnd.google-apps.folder".equals(mime);
        return new DriveFileSummary(String.valueOf(f.get("id")), String.valueOf(f.get("name")), mime, folder ? DriveFileSummary.TYPE_FOLDER : DriveFileSummary.TYPE_FILE, String.valueOf(f.get("webViewLink")), null);
    }

    private byte[] getFileBytes(GoogleOAuthCredentials credentials, String fileId) {
        String token = resolveToken(credentials);
        if (token == null) return null;
        try {
            return restClient(token).get().uri(BASE + "/" + fileId + "?alt=media").retrieve().body(byte[].class);
        } catch (Exception e) {
            log.warn("Drive getFileBytes error: {}", e.getMessage());
            return null;
        }
    }

    private void uploadMedia(String token, String fileId, String mimeType, byte[] content) {
        try {
            restClient(token).patch()
                    .uri(BASE + "/" + fileId + "?uploadType=media")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(content)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Drive uploadMedia error: {}", e.getMessage());
        }
    }
}
