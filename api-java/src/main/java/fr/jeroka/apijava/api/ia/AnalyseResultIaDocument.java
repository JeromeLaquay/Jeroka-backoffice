package fr.jeroka.apijava.api.ia;

import java.util.List;

/**
 * Résultat d'analyse IA d'un document (facture/devis).
 * Équivalent de DocumentIAService.AnalyseResultIaDocument en api-dashboard.
 */
public record AnalyseResultIaDocument(
        String type,
        DocumentParty supplier,
        DocumentParty client,
        String invoiceNumber,
        String quoteNumber,
        String date,
        String dueDate,
        List<DocumentItem> items,
        TaxInfo tax,
        Double totalHT,
        Double totalTTC
) {
    public record DocumentParty(
            String lastName, String firstName, String companyName,
            String addressLine1, String city, String postalCode, String country,
            String phone, String email, String website, String vatNumber, String siret, String rcs
    ) {}

    public record DocumentItem(String description, Double quantity, Double unitPrice, Double totalPrice) {}

    public record TaxInfo(Double rate, Double amount) {}
}
