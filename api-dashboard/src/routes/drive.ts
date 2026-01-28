import { Router, Response } from 'express';
import { GoogleDriveService } from '../api/google/googleDriveService';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { SocialCredentialsRepository } from '../repositories/socialCredentialsRepository';
import { UserRepository } from '../repositories/userRepository';
import { CompanyRepository } from '../repositories/companyRepository';
import { HistoryLogs } from '../repositories/historyLogs';
import { AnalyzeDocuments } from '../api/docs/analyzeDocuments';
import { GoogleDocumentRepository } from '../repositories/googleDocumentRepository';
import { GoogleDocument } from '../repositories/googleDocumentRepository';
import { DriveFileSummary } from '../api/google/googleDriveService';
import { DocumentIAService, AnalyseResultIaDocument } from '../api/ia/DocumentIAService';
import { GoogleDocumentService } from '../services/googleDocumentService';
import { PersonRepository, Person } from '../repositories/personRepository';
import { InvoiceRepository } from '../repositories/invoiceRepository';
import { QuoteRepository } from '../repositories/quoteRepository';
const router = Router();

router.get('/list', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserRepository.findById(req.user!.id);
    if (!user) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive list User, Cred, Company not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('User not found')});
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive list',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Cred not found')});
      return res.status(400).json({ success: false, message: 'Non configuré' });
    }
    const company = await CompanyRepository.findById(user.company_id);
    if (!company) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive list',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Company not found')});
      return res.status(400).json({ success: false, message: 'Company not found' });
    }
    const folderId  = company.google_drive_folder_id;
    if (!folderId) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive list',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Folder not found')});
      return res.status(400).json({ success: false, message: 'Folder not found' });
    }
      const list = await GoogleDriveService.listAllFilesAndFoldersInFolder(cred.credentials, folderId)
      return res.json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// Proxy streaming d'un fichier (inline)
router.get('/file/:fileId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserRepository.findById(req.user!.id);
    if (!user) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive getFileStream User not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('User not found')});
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive getFileStream Cred not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Cred not found')});
      return res.status(400).json({ success: false, message: 'Non configuré' });
    }
    const fileId = req.params.fileId;
    const file = await GoogleDriveService.getFileStream(cred.credentials, fileId);
    if (!file) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive getFileStream File not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('File not found')});
      return res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }
    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    if (file.name) res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    (file.stream as any).pipe(res);
    return res.json({ success: true, data: file });
  } catch (error) {
    HistoryLogs.create({user_id: req.user!.id,action: 'Drive getFileStream',status: 'error',type_error: 'database',complementary_data: JSON.stringify(error)});
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});



router.post('/create/:googleDriveId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserRepository.findById(req.user!.id);
    if (!user) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create User not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('User not found')});
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const cred = await SocialCredentialsRepository.getByUserIdAndPlatform(req.user!.id, 'google');
    if (!cred) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Cred not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Cred not found')});
      return res.status(400).json({ success: false, message: 'Non configuré' });
    }
    const googleDriveId = req.params.googleDriveId;
    const driveDoc : DriveFileSummary | null = await GoogleDriveService.getFile(cred.credentials, googleDriveId);
    if (!driveDoc) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create GoogleDrive not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('GoogleDrive not found')});
      return res.status(400).json({ success: false, message: 'GoogleDrive not found' });
    }
    
    // Récupérer le contenu du fichier depuis Google Drive
    const fileStream = await GoogleDriveService.getFileStream(cred.credentials, googleDriveId);
    if (!fileStream) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create File stream not found',status: 'error',type_error: 'api',complementary_data: JSON.stringify('File stream not found')});
      return res.status(400).json({ success: false, message: 'Impossible de récupérer le contenu du fichier' });
    }
    
    /** const extractedData = await AnalyzeDocuments.extractDataFromPdf(fileStream.stream);
    const analysis = await AnalyzeDocuments.generatePdfScreenshot(fileStream.stream);
    console.log('extractedData', extractedData);
    const company_google_documents = await GoogleDocumentRepository.findByCompanyId(user.company_id);
    if(company_google_documents.some((doc: GoogleDocument) => doc.extracted_data === extractedData)) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create GoogleDrive already exists',status: 'error',type_error: 'database',complementary_data: JSON.stringify('GoogleDrive already exists')});
      return res.status(302).json({ success: true, message: 'GoogleDrive already exists' });
    }**/
    const company = await CompanyRepository.findById(user.company_id);
    if (!company) {
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Company not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Company not found')});
      return res.status(400).json({ success: false, message: 'Company not found' });
    }
    const companyInfos = {
      name: company.name,
      email: company.email,
      phone: company.phone,
      address_line1: company.address_line1,
      city: company.city,
      postal_code: company.postal_code,
      country: company.country,
      description: 'boutique de jeux de société',
      siret: company.siret,
    }
    /**const analyseInvoice: AnalyseResultIaDocument | null = await DocumentIAService.analyseDocument(extractedData, company.name, JSON.stringify(companyInfos));
    **/
    
   const analyse = await AnalyzeDocuments.analyzePdfWithIA(cred.credentials, googleDriveId, company.name, JSON.stringify(companyInfos));
   const analyseInvoice: AnalyseResultIaDocument | null = analyse.iaAnalysis;
   const extractedData = analyse.extractedText;
   if (!analyseInvoice || !analyseInvoice.type || !analyseInvoice.supplier || !analyseInvoice.client || !extractedData) {
    HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Invoice analysis failed',status: 'error',type_error: 'api',complementary_data: JSON.stringify('Invoice analysis failed')});
    return res.status(400).json({ success: false, message: 'Analyse de la facture échouée' });
  } 

    let person: Person | null = null;
    if(analyseInvoice.type.includes('client')){
      if(!GoogleDocumentService.checkIfCompanyIsInSupplierPartOfInvoice(company, analyseInvoice.supplier)){
        HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Invoice company not in supplier',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Company not in supplier')});
        return res.status(400).json({ success: false, message: 'Company not in supplier' });
      }
      person = await PersonRepository.getPersonBySiretOrNameOrEmailAndType(user.company_id, analyseInvoice.client.siret ?? '', analyseInvoice.client.first_name ?? '', analyseInvoice.client.last_name ?? '', analyseInvoice.client.email ?? '', 'client');
      if(!person){
        person = {
          company_id: user.company_id,
          first_name: analyseInvoice.client.first_name ?? '',
          last_name: analyseInvoice.client.last_name ?? '',
          email: analyseInvoice.client.email ?? '',
          siret: analyseInvoice.client.siret ?? '',
          address_line1: analyseInvoice.client.address_line1 ?? '',
          city: analyseInvoice.client.city ?? '',
          postal_code: analyseInvoice.client.postal_code ?? '',
          country: analyseInvoice.client.country ?? '',
          type: 'client',
        }
        person = await PersonRepository.createPerson(person);
      }
    }else if (analyseInvoice.type.includes('fournisseur')){
      if(!GoogleDocumentService.checkIfCompanyIsInClientPartOfInvoice(company, analyseInvoice.client)){
        HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Invoice company not in client',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Company not in client')});
        return res.status(400).json({ success: false, message: 'Company not in client' });
      }
      person = await PersonRepository.getPersonBySiretOrNameOrEmailAndType(user.company_id, analyseInvoice.supplier.siret ?? '', analyseInvoice.supplier.first_name ?? '', analyseInvoice.supplier.last_name ?? '', analyseInvoice.supplier.email ?? '', 'supplier');
      if(!person){
        person = {
          company_id: user.company_id,
          first_name: analyseInvoice.supplier.first_name ?? '',
          last_name: analyseInvoice.supplier.last_name ?? '',
          email: analyseInvoice.supplier.email ?? '',
          siret: analyseInvoice.supplier.siret ?? '',
          address_line1: analyseInvoice.supplier.address_line1 ?? '',
          city: analyseInvoice.supplier.city ?? '',
          postal_code: analyseInvoice.supplier.postal_code ?? '',
          country: analyseInvoice.supplier.country ?? '',
          type: 'supplier',
        }
        person = await PersonRepository.createPerson(person);
      }
    }
    console.log('person', person);
    if(!person || !person.id ){
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Invoice person not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Person not found')});
      return res.status(400).json({ success: false, message: 'Person not found' });
    }
    let result: GoogleDocument = {
      google_doc_id: googleDriveId,
      google_email_id: null,
      person_id: person.id,
      company_id: user.company_id,
      name: driveDoc.name,
      mime_type: driveDoc.mimeType,
      extracted_data: extractedData,
      analyzed_data: JSON.stringify(analyseInvoice),
      web_view_link: driveDoc.webViewLink
    }
    //creér google docuemlnt in base
    const googleDocument = await GoogleDocumentRepository.create(result);

    if(analyseInvoice.type.includes('facture')){
      const invoice = await InvoiceRepository.create({
        google_doc_id: googleDocument.id,
        company_id: user.company_id,
        person_id: person.id,
        invoice_number: analyseInvoice.invoiceNumber ?? '',
        status: 'draft',
        total: analyseInvoice.totalHT ?? 0,
        tax: analyseInvoice.tax?.amount ?? 0,
        subtotal: analyseInvoice.totalHT ?? 0,
        due_date: analyseInvoice.dueDate ? new Date(analyseInvoice.dueDate).toISOString() : new Date().toISOString(),
        issue_date: analyseInvoice.date ? new Date(analyseInvoice.date).toISOString() : new Date().toISOString(),
        notes: '',
      });
      result.invoice_id = invoice.id;
    }else if(analyseInvoice.type.includes('devis')){
      const quote = await QuoteRepository.create({
        company_id: user.company_id,
        google_doc_id: googleDocument.google_doc_id,
        person_id: person.id,
        status: 'draft',
        quote_number: analyseInvoice.quoteNumber ?? '',
        total: analyseInvoice.totalHT ?? 0,
        tax: analyseInvoice.tax?.amount ?? 0,
        subtotal: analyseInvoice.totalHT ?? 0,
        valid_until: analyseInvoice.dueDate ? new Date(analyseInvoice.dueDate).toISOString() : new Date().toISOString(),
        issue_date: analyseInvoice.date ? new Date(analyseInvoice.date).toISOString() : new Date().toISOString(),
        notes: '',
      });
      result.quote_id = quote.id;
    }
    
    if(!result || !result.invoice_id && !result.quote_id){
      HistoryLogs.create({user_id: req.user!.id,action: 'Drive create Invoice or quote not found',status: 'error',type_error: 'database',complementary_data: JSON.stringify('Invoice or quote not found')});
      return res.status(400).json({ success: false, message: 'Invoice or quote not found' });
    }
    
    return res.json({ success: true, data: result });
  }catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

export default router;