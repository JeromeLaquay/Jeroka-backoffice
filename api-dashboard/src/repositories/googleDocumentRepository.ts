import { query } from '../database/connection';

export class GoogleDocument {
  google_doc_id?: string;
  google_email_id?: string | null;
  invoice_id?: string | null;
  quote_id?: string | null;
  person_id?: string | null;
  company_id?: string | null;
  name?: string | null;
  mime_type?: string | null;
  extracted_data?: string | null;
  analyzed_data?: string | null;
  web_view_link?: string | null;
}

export class GoogleDocumentRepository {
  static async findByCompanyId(companyId: string) {
    const result = await query('SELECT * FROM google_documents WHERE company_id = $1', [companyId]);
    return result.rows;
  }
  static async create(googleDocument: GoogleDocument) {
    const result = await query('INSERT INTO google_documents (google_doc_id, google_email_id, invoice_id, quote_id, person_id, company_id, name, mime_type, extracted_data, analyzed_data, web_view_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [googleDocument.google_doc_id, googleDocument.google_email_id, googleDocument.invoice_id, googleDocument.quote_id, googleDocument.person_id, googleDocument.company_id, googleDocument.name, googleDocument.mime_type, googleDocument.extracted_data, googleDocument.analyzed_data, googleDocument.web_view_link]);
    return result.rows[0];
  }
}

export default new GoogleDocumentRepository();