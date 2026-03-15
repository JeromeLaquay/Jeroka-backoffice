package fr.jeroka.apijava.api.ia;

/**
 * Implémentation stub : retourne un résultat d'analyse vide. Bean créé par ApiStubsConfig.
 */
public class DocumentIAServiceStub implements DocumentIAService {

    @Override
    public AnalyseResultIaDocument analyseDocument(
            String extractedData, String companyName, String companyInfos, String screenshotBase64) {
        return new AnalyseResultIaDocument(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
