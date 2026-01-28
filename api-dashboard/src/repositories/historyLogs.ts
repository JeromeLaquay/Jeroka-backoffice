import { query } from '../database/connection';

export class HistoryLog {
  user_id?: string;
  invoice_id?: string;
  quote_id?: string;
  person_id?: string;
  product_id?: string;
  publication_id?: string;
  publication_platform_id?: string;
  appointment_id?: string;
  google_document_id?: string;
  google_event_id?: string;
  google_email_id?: string;
  google_doc_id?: string;
  google_doc_name?: string;
  google_doc_mime_type?: string;
  google_doc_extracted_data?: string;
  google_doc_analyzed_data?: string;
  action?: string;
  complementary_data?: string;
  status?: 'success' | 'error';
  type_error?: '' | 'unknown' | 'api' | 'database' | 'other' ;
  created_at?: Date;
}

export interface HistoryLogFilters {
  user_id?: string;
  invoice_id?: string;
  quote_id?: string;
  person_id?: string;
  product_id?: string;
  publication_id?: string;
  publication_platform_id?: string;
  appointment_id?: string;
  google_document_id?: string;
  google_event_id?: string;
  google_email_id?: string;
  google_doc_id?: string;
  google_doc_name?: string;
  google_doc_mime_type?: string;
  google_doc_extracted_data?: string;
  google_doc_analyzed_data?: string;
  action?: string;
  status?: 'success' | 'error';
  type_error?:  '' | 'unknown' | 'api' | 'database' | 'other' ;
  complementary_data?: string;
  created_at?: Date;
}

export class HistoryLogs {
  static async create(historyLog: HistoryLog) {
    const result = await query('INSERT INTO history_logs (user_id, invoice_id, quote_id, person_id, product_id, publication_id, publication_platform_id, appointment_id, google_document_id, google_event_id, google_email_id, google_doc_id, google_doc_name, google_doc_mime_type, google_doc_extracted_data, google_doc_analyzed_data, action, complementary_data, status, type_error) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)', [historyLog.user_id, historyLog.invoice_id, historyLog.quote_id, historyLog.person_id, historyLog.product_id, historyLog.publication_id, historyLog.publication_platform_id, historyLog.appointment_id, historyLog.google_document_id, historyLog.google_event_id, historyLog.google_email_id, historyLog.google_doc_id, historyLog.google_doc_name, historyLog.google_doc_mime_type, historyLog.google_doc_extracted_data, historyLog.google_doc_analyzed_data, historyLog.action, historyLog.complementary_data, historyLog.status, historyLog.type_error]);
    return result.rows[0];
  }

  static async find(filters: Partial<HistoryLogFilters>) {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Construire les conditions dynamiquement
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    // Si aucune condition, retourner tous les logs
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const queryText = `SELECT * FROM history_logs ${whereClause} ORDER BY created_at DESC`;
    
    const result = await query(queryText, values);
    return result.rows;
  }

}