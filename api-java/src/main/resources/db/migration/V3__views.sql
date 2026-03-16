-- Vue dashboard_stats : totaux et compteurs récents par entreprise (alignée api-dashboard)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    c.id AS company_id,
    (SELECT COUNT(*) FROM persons   WHERE company_id = c.id AND type = 'client') AS total_clients,
    (SELECT COUNT(*) FROM messages  WHERE company_id = c.id) AS total_messages,
    (SELECT COUNT(*) FROM invoices  WHERE company_id = c.id) AS total_invoices,
    (SELECT COUNT(*) FROM quotes    WHERE company_id = c.id) AS total_quotes,
    (SELECT COUNT(*) FROM persons  WHERE company_id = c.id AND created_at >= NOW() - INTERVAL '1 month' AND type = 'client') AS new_persons_month,
    (SELECT COUNT(*) FROM messages WHERE company_id = c.id AND created_at >= NOW() - INTERVAL '1 week')  AS new_messages_week,
    (SELECT COUNT(*) FROM invoices WHERE company_id = c.id AND created_at >= NOW() - INTERVAL '1 month') AS new_invoices_month,
    (SELECT COUNT(*) FROM quotes   WHERE company_id = c.id AND created_at >= NOW() - INTERVAL '1 month') AS new_quotes_month,
    COALESCE((
      SELECT json_agg(row_to_json(p)) FROM (
        SELECT id, first_name, last_name, email, phone, created_at
        FROM persons WHERE company_id = c.id ORDER BY created_at DESC LIMIT 3
      ) p
    ), '[]'::json) AS recent_persons,
    COALESCE((
      SELECT json_agg(row_to_json(m)) FROM (
        SELECT id, first_name, last_name, email, subject, message, status, source AS type, created_at
        FROM messages WHERE company_id = c.id ORDER BY created_at DESC LIMIT 3
      ) m
    ), '[]'::json) AS recent_messages,
    COALESCE((
      SELECT json_agg(row_to_json(i)) FROM (
        SELECT id, invoice_number, person_id, total_ttc, status, created_at
        FROM invoices WHERE company_id = c.id ORDER BY created_at DESC LIMIT 3
      ) i
    ), '[]'::json) AS recent_invoices,
    COALESCE((
      SELECT json_agg(row_to_json(q)) FROM (
        SELECT id, quote_number, person_id, total_ttc, status, created_at
        FROM quotes WHERE company_id = c.id ORDER BY created_at DESC LIMIT 3
      ) q
    ), '[]'::json) AS recent_quotes
FROM companies c;
