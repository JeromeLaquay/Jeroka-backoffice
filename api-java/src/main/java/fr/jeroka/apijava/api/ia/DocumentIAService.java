package fr.jeroka.apijava.api.ia;

/**
 * Analyse de documents (factures, devis) via IA.
 * Utilise le service IA pour extraire les champs structurés.
 */
public interface DocumentIAService {

    AnalyseResultIaDocument analyseDocument(
            String extractedData, String companyName, String companyInfos, String screenshotBase64);
}
