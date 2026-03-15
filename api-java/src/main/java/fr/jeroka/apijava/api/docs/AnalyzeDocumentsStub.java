package fr.jeroka.apijava.api.docs;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import fr.jeroka.apijava.api.google.GoogleDriveService;
import fr.jeroka.apijava.api.ia.AnalyseResultIaDocument;
import fr.jeroka.apijava.api.ia.DocumentIAService;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Implémentation stub : orchestration Drive + IA. Télécharge le fichier depuis Drive (stub),
 * extrait le texte (vide), appelle DocumentIAService. À remplacer par PDFBox + vrai IA.
 */
@Component
public class AnalyzeDocumentsStub implements AnalyzeDocuments {

    private final GoogleDriveService driveService;
    private final DocumentIAService documentIAService;

    public AnalyzeDocumentsStub(GoogleDriveService driveService, DocumentIAService documentIAService) {
        this.driveService = driveService;
        this.documentIAService = documentIAService;
    }

    @Override
    public String extractDataFromPdf(byte[] attachmentData) {
        return attachmentData != null && attachmentData.length > 0 ? "" : "";
    }

    @Override
    public byte[] downloadPdfFromDrive(GoogleOAuthCredentials credentials, String fileId) {
        var result = driveService.getFileStream(credentials, fileId);
        if (result == null) return new byte[0];
        return readAllBytes(result.stream());
    }

    @Override
    public String generatePdfScreenshot(byte[] pdfBuffer) {
        return null;
    }

    @Override
    public AnalyseResultIaDocument analyzeDocumentFromDrive(GoogleOAuthCredentials credentials,
                                                            String fileId, String companyName, String companyInfos) {
        byte[] pdfBytes = downloadPdfFromDrive(credentials, fileId);
        String extracted = extractDataFromPdf(pdfBytes);
        return documentIAService.analyseDocument(extracted, companyName, companyInfos, null);
    }

    private static byte[] readAllBytes(InputStream in) {
        try (var out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            return out.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }
}
