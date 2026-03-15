package fr.jeroka.apijava.api.docs;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import fr.jeroka.apijava.api.ia.AnalyseResultIaDocument;

/**
 * Orchestration Drive + IA pour l'analyse de documents (PDF, etc.).
 * Équivalent de api-dashboard/src/api/docs/analyzeDocuments.ts
 */
public interface AnalyzeDocuments {

    String extractDataFromPdf(byte[] attachmentData);

    byte[] downloadPdfFromDrive(GoogleOAuthCredentials credentials, String fileId);

    String generatePdfScreenshot(byte[] pdfBuffer);

    AnalyseResultIaDocument analyzeDocumentFromDrive(GoogleOAuthCredentials credentials,
                                                     String fileId, String companyName, String companyInfos);
}
