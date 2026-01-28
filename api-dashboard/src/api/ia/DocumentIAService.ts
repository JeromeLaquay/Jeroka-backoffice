import { iaService } from './iaService';

export class AnalyseResultIaDocument {
type?: 'devis client'| 'facture client'| 'facture fournisseur'| 'devis fournisseur';
supplier?: {
  last_name?: string;
  first_name?: string;
  company_name?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  vat_number?: string;
  siret?: string;
  rcs?: string;
};
client?: {
  last_name?: string;
  first_name?: string;
  company_name?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  vat_number?: string;
  siret?: string;
  rcs?: string;
};
invoiceNumber?: string;
quoteNumber?: string;
date?: string;
dueDate?: string;
items?: Array<{
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}>;
tax?: {
  rate?: number;
  amount?: number;
};
totalHT?: number;
totalTTC?: number
}

export class DocumentIAService {
  static async analyseDocument(extractedData: string, companyName: string, companyInfos: string, screenshotBase64?: string): Promise<AnalyseResultIaDocument | null> {
    const prompt = this.buildPrompt(extractedData, companyName, companyInfos, screenshotBase64);
    const aiResponse = await iaService.callOpenAI(prompt);
    if (!aiResponse) return null;
    const jsonText = this.cleanAiJson(aiResponse);
    const parsed = JSON.parse(jsonText) as AnalyseResultIaDocument;
    return this.normalizeParties(parsed, companyName);
  }

  private static buildPrompt(extractedData: string, companyName: string, companyInfos: string, screenshotBase64?: string): string {
    let prompt = `Tu es un assistant IA professionnel appartenant à ${companyName}. Voici ces infos : ${companyInfos}.

Tu analyses les documents. Détermine si c'est une facture client, une facture fournisseur, un devis client ou un devis fournisseur.

RÈGLES IMPORTANTES :
- Si ${companyName} est le FOURNISSEUR (celui qui émet la facture/devis) → type = "facture client" ou "devis client"
- Si ${companyName} est le CLIENT (celui qui reçoit la facture/devis) → type = "facture fournisseur" ou "devis fournisseur"

ATTENTION : Ne te trompe pas sur le sens ! 
- Dans une facture fournisseur, ${companyName} est le CLIENT qui reçoit la facture
- Dans une facture client, ${companyName} est le FOURNISSEUR qui émet la facture

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans backticks, sans markdown.
Vérifie que les informations du fournisseur et du client sont correctes.
Texte à analyser : ${extractedData}`;

    if (screenshotBase64) {
      prompt += `\n\nTu as également accès à une capture d'écran du document original. Utilise-la pour confirmer ou corriger les informations extraites du texte.`;
      prompt += `\n si le logo est le logo de ${companyName} alors c'est une facture client ou un devis client. Autrement c'est une facture fournisseur ou un devis fournisseur.`;
    }

    prompt += `\n\nRetourne un objet JSON avec cette structure exacte :
{\n  type?: 'devis client'| 'facture client'| 'facture fournisseur'| 'devis fournisseur';\n supplier?: { last_name?: string; first_name?: string; company_name?: string; address_line1?: string; city?: string; postal_code?: string; country?: string; phone?: string; email?: string; website?: string; vat_number?: string; siret?: string; rcs?: string; };\n client?: { last_name?: string; first_name?: string; company_name?: string; address_line1?: string; city?: string; postal_code?: string; country?: string; phone?: string; email?: string; website?: string; vat_number?: string; siret?: string; rcs?: string; };\n invoiceNumber?: string; quoteNumber?: string; date?: string; dueDate?: string; items?: Array<{ description?: string; quantity?: number; unitPrice?: number; totalPrice?: number; }>;\n tax?: { rate?: number; amount?: number; }; totalHT?: number; totalTTC?: number }`;

    return prompt;
  }

  private static cleanAiJson(aiResponse: string): string {
    let cleaned = aiResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/\s*```$/, '');
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) cleaned = cleaned.substring(firstBrace);
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleaned.length - 1) cleaned = cleaned.substring(0, lastBrace + 1);
    return cleaned.trim();
  }

  private static normalizeParties(result: AnalyseResultIaDocument, companyName: string): AnalyseResultIaDocument {
    const name = (v?: string) => (v || '').toLowerCase().trim();
    const company = name(companyName);
    const supplierName = name(result?.supplier?.company_name);
    const clientName = name(result?.client?.company_name);
    
    const supplierMatches = supplierName.includes(company) || company.includes(supplierName);
    const clientMatches = clientName.includes(company) || company.includes(clientName);
    
    console.log('=== NORMALIZE PARTIES DEBUG ===');
    console.log('Company:', company);
    console.log('Supplier name:', supplierName);
    console.log('Client name:', clientName);
    console.log('Supplier matches:', supplierMatches);
    console.log('Client matches:', clientMatches);
    console.log('Document type:', result.type);
    
    // Règle 1: Si c'est une facture fournisseur et que notre société est côté supplier, on inverse
    if (result.type?.includes('fournisseur') && supplierMatches) {
      console.log('INVERSION: Facture fournisseur avec société côté supplier');
      return { ...result, supplier: result.client, client: result.supplier };
    }
    
    // Règle 2: Si c'est une facture client et que notre société est côté client, on inverse
    if (result.type?.includes('client') && !result.type?.includes('fournisseur') && clientMatches) {
      console.log('INVERSION: Facture client avec société côté client');
      return { ...result, supplier: result.client, client: result.supplier };
    }
    
    return result;
  }
}
export default DocumentIAService;