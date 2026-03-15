package fr.jeroka.apijava.api.google;

import java.io.InputStream;
import java.util.List;

/**
 * Contrat pour l'intégration Google Drive (list/download/upload, arborescence).
 */
public interface GoogleDriveService {

    List<DriveFileSummary> listAllFilesAndFoldersInFolder(GoogleOAuthCredentials credentials,
                                                          String folderId, int pageSize);

    /** Liste les enfants directs d'un dossier (sans charger les sous-dossiers). Pour l'API REST. */
    List<DriveFileSummary> listDirectChildren(GoogleOAuthCredentials credentials, String folderId, int pageSize);

    boolean downloadFile(GoogleOAuthCredentials credentials, String fileId, String destinationPath);

    DriveFileSummary getFile(GoogleOAuthCredentials credentials, String fileId);

    DriveFileSummary createFile(GoogleOAuthCredentials credentials, CreateFileRequest request);

    boolean deleteFile(GoogleOAuthCredentials credentials, String fileId);

    FileStreamResult getFileStream(GoogleOAuthCredentials credentials, String fileId);

    record FileStreamResult(InputStream stream, String mimeType, String name) {}

    record CreateFileRequest(String parentFolderId, String name, String mimeType,
                            String contentPath, byte[] contentBuffer) {}
}
