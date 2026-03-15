package fr.jeroka.apijava.api.google;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implémentation in-memory (stub) : arborescence et contenu en mémoire.
 * downloadFile écrit le contenu sur le disque si possible. À remplacer par Google API Client.
 * Bean créé par WebConfig (config package).
 */
public class GoogleDriveServiceStub implements GoogleDriveService {

    private static final String ROOT_ID = "root";
    private final Map<String, DriveFileSummary> filesById = new ConcurrentHashMap<>();
    private final Map<String, List<String>> childrenByParent = new ConcurrentHashMap<>();
    private final Map<String, byte[]> contentById = new ConcurrentHashMap<>();

    public GoogleDriveServiceStub() {
        childrenByParent.put(ROOT_ID, new ArrayList<>());
    }

    @Override
    public List<DriveFileSummary> listAllFilesAndFoldersInFolder(GoogleOAuthCredentials credentials,
                                                                  String folderId, int pageSize) {
        List<String> ids = childrenByParent.getOrDefault(folderId, List.of());
        List<DriveFileSummary> result = new ArrayList<>();
        int n = 0;
        for (String id : ids) {
            if (n >= pageSize) break;
            DriveFileSummary f = filesById.get(id);
            if (f == null) continue;
            if (DriveFileSummary.TYPE_FOLDER.equals(f.type())) {
                List<DriveFileSummary> sub = listAllFilesAndFoldersInFolder(credentials, id, pageSize);
                result.add(new DriveFileSummary(f.id(), f.name(), f.mimeType(), f.type(), f.webViewLink(), sub));
            } else {
                result.add(f);
            }
            n++;
        }
        return result;
    }

    @Override
    public List<DriveFileSummary> listDirectChildren(GoogleOAuthCredentials credentials, String folderId, int pageSize) {
        List<String> ids = childrenByParent.getOrDefault(folderId, List.of());
        List<DriveFileSummary> result = new ArrayList<>();
        int n = 0;
        for (String id : ids) {
            if (n >= pageSize) break;
            DriveFileSummary f = filesById.get(id);
            if (f != null) {
                result.add(new DriveFileSummary(f.id(), f.name(), f.mimeType(), f.type(), f.webViewLink(), null));
            }
            n++;
        }
        return result;
    }

    @Override
    public boolean downloadFile(GoogleOAuthCredentials credentials, String fileId, String destinationPath) {
        byte[] content = contentById.get(fileId);
        if (content == null) return false;
        try {
            Files.write(Path.of(destinationPath), content);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public DriveFileSummary getFile(GoogleOAuthCredentials credentials, String fileId) {
        return filesById.get(fileId);
    }

    @Override
    public DriveFileSummary createFile(GoogleOAuthCredentials credentials, CreateFileRequest request) {
        String id = UUID.randomUUID().toString();
        String parent = request.parentFolderId() != null ? request.parentFolderId() : ROOT_ID;
        childrenByParent.putIfAbsent(parent, new ArrayList<>());
        childrenByParent.get(parent).add(id);
        byte[] content = request.contentBuffer();
        if (content != null) contentById.put(id, content);
        var summary = new DriveFileSummary(id, request.name(), request.mimeType(),
                DriveFileSummary.TYPE_FILE, null, null);
        filesById.put(id, summary);
        return summary;
    }

    @Override
    public boolean deleteFile(GoogleOAuthCredentials credentials, String fileId) {
        DriveFileSummary f = filesById.remove(fileId);
        contentById.remove(fileId);
        if (f == null) return false;
        for (List<String> children : childrenByParent.values())
            children.remove(fileId);
        return true;
    }

    @Override
    public FileStreamResult getFileStream(GoogleOAuthCredentials credentials, String fileId) {
        DriveFileSummary f = filesById.get(fileId);
        if (f == null) return null;
        byte[] content = contentById.getOrDefault(fileId, new byte[0]);
        InputStream stream = new ByteArrayInputStream(content);
        return new FileStreamResult(stream, f.mimeType(), f.name());
    }
}
