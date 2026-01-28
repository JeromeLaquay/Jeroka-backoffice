import { UserRepository } from '../repositories/userRepository';
import { GoogleDocumentRepository } from '../repositories/googleDocumentRepository';
import { GoogleMailService } from '../api/google/googleMailService';
import { SocialCredentialsRepository, SocialCredentials } from '../repositories/socialCredentialsRepository';
import { PersonRepository } from '../repositories/personRepository';
import { GmailMessageSimple } from '../api/google/googleMailService';
import { GoogleDocument } from '../repositories/googleDocumentRepository';
import { GoogleDriveService } from '../api/google/googleDriveService';
import { AnalyzeDocuments } from '../api/docs/analyzeDocuments';
import { CompanyRepository, Company } from '../repositories/companyRepository';
import { AnalyseResultIaDocument } from '../api/ia/DocumentIAService';
import { InvoiceRepository, CreateInvoiceData, CreateInvoiceItemData} from '../repositories/invoiceRepository';
import { Person } from '../repositories/personRepository';
export class GoogleDocumentService {
    static async getLastEmailsFromUserWithDocuments(userId: string) {
        const user = await UserRepository.findById(userId);
        console.log('user', user);
        if (!user) {
            throw new Error('User not found');
        }
        
        const credentials: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(user.id, 'google');
        if(!credentials) {
            return {
                success: false,
                message: 'Aucune connexion Google configurée',
                emails: []
            };
        }
        
        const googleCompanyDocs = await GoogleDocumentRepository.findByCompanyId(user.company_id);
        const lastEmails = await GoogleMailService.getRecentEmails(credentials.decryptedCredentials, new Date(), 10);
        
        return {
            success: true,
            emails: lastEmails,
            documents: googleCompanyDocs
        };
    }

    /**
     * Récupère les documents récents dans les emails de l'utilisateur
     *  - etape1 : récupérer l'utilisateur
     *  - etape1.1 : récupérer les crédentials Google de l'utilisateur
     *  - etape2 : récupérer recent emails de l'utilisateur
     *  - etape4 : filtrer si l'email de l'expéditeur appartient à une personne de la base de données
     *  - etape5 : récupérer documents du mail sur Gmail
     *  - etape6 : filtrer si les documents sont déjà dans la base de données
     *  - etape9 : créer document dans la base
     * @param userId 
     */
    static async getRecentsDocumentsInMail(userId: string): Promise<GoogleDocument[]> {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        const credentials: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(user.id, 'google');
        if(!credentials) {
            throw new Error('Aucune connexion Google configurée');
        }
       
        const lastEmails: GmailMessageSimple[] = await GoogleMailService.getRecentEmails(credentials.decryptedCredentials, new Date(), 10);
        const persons = await PersonRepository.getPersons(user.company_id);
        // récupérer les emails des clients et fournisseurs et filtrer les emails qui ont des pièces jointes
        const documentsEmails: GmailMessageSimple[] = lastEmails.filter(email => persons.data.some(person => person.email === email.from))
        .filter(email => email.attachments && email.attachments.length > 0)
        const resultatsDocuments: GoogleDocument[] = [];
        //pour chaque email, on crée un document sur google drive et on l'ajoute à la base de données
        for (const email of documentsEmails) {
            if (email.attachments) {
                for (const attachment of email.attachments) {
                    const newDoc = await this.createGoogleDocumentForAnEmail(user, credentials, attachment, email.id!);
                    if (newDoc) {
                        resultatsDocuments.push(newDoc);
                    }
                }
            }
        }
        return resultatsDocuments;
    }


    /**
     * Crée un document sur Google Drive et l'ajoute à la base de données
     * @param user 
     * @param credentials 
     * @param attachment 
     * @param emailId 
     * @returns 
     */
    static async createGoogleDocumentForAnEmail(user: any, credentials: SocialCredentials, attachment: any, emailId: string): Promise<GoogleDocument | null> {
        // Vérification de l'existence de l'id d'attachement et filtrage des types non-document
        if (!('id' in attachment) || !attachment.id) {
            console.log('Attachement ignoré (pas d\'ID):', attachment);
            return null;
        }
        
        // Ignorer les attachements multipart/alternative (corps de l'email)
        if (attachment.mimeType === 'multipart/alternative' || !attachment.filename || attachment.mimeType === 'application/json') {
            console.log('Attachement ignoré (type multipart ou pas de nom ou pas de mimeType):', attachment);
            return null;
        }
        const attachmentData = await GoogleMailService.getAttachmentData(
            credentials.decryptedCredentials,
            (attachment as any).id,
            emailId
        );
        console.log('attachmentData', attachmentData);
        if (!attachmentData) {
            throw new Error('Erreur lors de la récupération des données de l\'attachement');
        }
        const extractedData = await AnalyzeDocuments.extractDataFromPdf(attachmentData);
        console.log('extractedData', extractedData);
        const company_google_documents = await GoogleDocumentRepository.findByCompanyId(user.company_id);
        if(company_google_documents.some((doc: GoogleDocument) => doc.extracted_data === extractedData)) {
            console.log('Document déjà existant');
            return null;
        }
        // Convertir les données base64 en Buffer pour l'upload
        const fileBuffer = Buffer.from(attachmentData, 'base64');
        const company: Company | null = await CompanyRepository.findById(user.company_id);
        if(!company) {
            throw new Error('Company not found');
        }
        const googleDoc = await GoogleDriveService.createFile(
            credentials.decryptedCredentials,
            company.google_drive_folder_id ?? '',
            attachment.filename,
            attachment.mimeType ?? '',
            undefined, // contentPath
            fileBuffer  // contentBuffer
        );
        console.log('googleDoc', googleDoc);
        if (!googleDoc) {
            throw new Error('Erreur lors de la création du document sur Google Drive');
        }
        return await GoogleDocumentRepository.create({
            google_doc_id: googleDoc.id,
            google_email_id: emailId,
            company_id: user.company_id,
            name: attachment.filename,
            mime_type: attachment.mimeType,
            extracted_data: extractedData,
            web_view_link: googleDoc.webViewLink ?? undefined,
        });
    }

    static checkIfCompanyIsInClientPartOfInvoice(company: Company, client: any){
        console.log('client', client);
        console.log('company', company);
        if(client.company_name?.toLowerCase()?.includes(company.name.toLowerCase() ?? '') || client.siret?.toLowerCase().includes(company.siret?.toLowerCase() ?? '') || client.email?.toLowerCase().includes(company.email?.toLowerCase() ?? '') || client.phone?.toLowerCase().includes(company.phone?.toLowerCase() ?? '')){
            return true;
        }
        return false;
    }

    static checkIfCompanyIsInSupplierPartOfInvoice(company: Company, supplier: any){
        console.log('supplier', supplier);
        console.log('company', company);
        if(supplier.company_name?.includes(company.name ?? '') || supplier.siret?.includes(company.siret ?? '') || supplier.email?.includes(company.email ?? '') || supplier.phone?.includes(company.phone ?? '')){
            return true;
        }
        return false;
    }
}

export default GoogleDocumentService;