-- =============================================
-- TRIGGERS pour updated_at automatique
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables avec updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_platforms_updated_at BEFORE UPDATE ON publication_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_categories_updated_at BEFORE UPDATE ON email_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_senders_updated_at BEFORE UPDATE ON email_senders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================
CREATE OR REPLACE FUNCTION generate_quote_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    quote_number TEXT;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'DV' || year_suffix || '-([0-9]+)') AS INTEGER)), 0) + 1
    INTO counter
    FROM quotes
    WHERE company_id = company_uuid
    AND quote_number LIKE 'DV' || year_suffix || '-%';
    quote_number := 'DV' || year_suffix || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    year_suffix TEXT;
    counter INTEGER;
    invoice_number TEXT;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'FA' || year_suffix || '-([0-9]+)') AS INTEGER)), 0) + 1
    INTO counter
    FROM invoices
    WHERE company_id = company_uuid
    AND invoice_number LIKE 'FA' || year_suffix || '-%';
    invoice_number := 'FA' || year_suffix || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;
