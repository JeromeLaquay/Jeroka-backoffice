-- =============================================
-- JEROKA DASHBOARD - SCHEMA MULTI-TENANT
-- =============================================

-- Suppression des tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS availability_rules CASCADE;
DROP TABLE IF EXISTS publication_platforms CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS message_replies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABLE: companies (Entreprises)
-- =============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    siret VARCHAR(14) UNIQUE,
    vat_number VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    industry VARCHAR(100),
    size VARCHAR(50), -- 'micro', 'small', 'medium', 'large'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 5,
    max_clients INTEGER DEFAULT 100,
    max_storage_mb INTEGER DEFAULT 1000,
    settings JSONB DEFAULT '{}', -- Configuration spécifique à l'entreprise
    billing_info JSONB DEFAULT '{}', -- Informations de facturation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_siret ON companies(siret);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_subscription_plan ON companies(subscription_plan);

-- =============================================
-- TABLE: users (Utilisateurs liés aux entreprises)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    is_company_admin BOOLEAN DEFAULT false, -- Admin de l'entreprise
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '{}', -- Permissions spécifiques
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique email par entreprise
    UNIQUE(company_id, email)
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_company_admin ON users(is_company_admin);

-- =============================================
-- TABLE: refresh_tokens
-- =============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================
-- TABLE: clients (Clients liés aux entreprises)
-- =============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'individual' CHECK (type IN ('individual', 'company')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    siret VARCHAR(14),
    vat_number VARCHAR(50),
    website VARCHAR(255),
    notes TEXT,
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    source VARCHAR(50), -- Comment le client nous a trouvé
    tags TEXT[], -- Tags pour catégoriser
    custom_fields JSONB DEFAULT '{}', -- Champs personnalisés par entreprise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique email par entreprise
    UNIQUE(company_id, email)
);

CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_company_name ON clients(company_name);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- =============================================
-- TABLE: contact_messages (Messages liés aux entreprises)
-- =============================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'other' CHECK (type IN ('devis', 'information', 'partnership', 'support', 'other')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    client_id UUID REFERENCES clients(id), -- Lien vers client si existant
    ip_address INET,
    user_agent TEXT,
    source VARCHAR(100), -- Page/formulaire d'origine
    tags TEXT[],
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_company_id ON contact_messages(company_id);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_type ON contact_messages(type);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_priority ON contact_messages(priority);

-- =============================================
-- TABLE: products (Produits liés aux entreprises)
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    price_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    price_ttc DECIMAL(10,2) GENERATED ALWAYS AS (price_ht * (1 + vat_rate/100)) STORED,
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit VARCHAR(20) DEFAULT 'pièce',
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height}
    images TEXT[], -- URLs des images
    is_active BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}', -- Champs personnalisés
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique SKU par entreprise
    UNIQUE(company_id, sku)
);

CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_price_ht ON products(price_ht);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);

-- =============================================
-- TABLE: quotes (Devis liés aux entreprises)
-- =============================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    title VARCHAR(255),
    description TEXT,
    subtotal_ht DECIMAL(10,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_ht DECIMAL(10,2) DEFAULT 0,
    total_vat DECIMAL(10,2) DEFAULT 0,
    total_ttc DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    terms_conditions TEXT,
    payment_terms VARCHAR(255),
    delivery_delay VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique numéro de devis par entreprise
    UNIQUE(company_id, quote_number)
);

CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

-- =============================================
-- TABLE: quote_items
-- =============================================
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'pièce',
    unit_price_ht DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    total_ht DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_ht * (1 - discount_percent/100)) STORED,
    total_vat DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price_ht * (1 - discount_percent/100)) * vat_rate/100) STORED,
    total_ttc DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price_ht * (1 - discount_percent/100)) * (1 + vat_rate/100)) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);

-- =============================================
-- TABLE: invoices (Factures liées aux entreprises)
-- =============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    type VARCHAR(20) DEFAULT 'invoice' CHECK (type IN ('invoice', 'credit_note', 'proforma')),
    title VARCHAR(255),
    description TEXT,
    subtotal_ht DECIMAL(10,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_ht DECIMAL(10,2) DEFAULT 0,
    total_vat DECIMAL(10,2) DEFAULT 0,
    total_ttc DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_due DECIMAL(10,2) DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_terms VARCHAR(255),
    payment_method VARCHAR(50),
    bank_details TEXT,
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique numéro de facture par entreprise
    UNIQUE(company_id, invoice_number)
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- =============================================
-- TABLE: invoice_items
-- =============================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'pièce',
    unit_price_ht DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    total_ht DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_ht * (1 - discount_percent/100)) STORED,
    total_vat DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price_ht * (1 - discount_percent/100)) * vat_rate/100) STORED,
    total_ttc DECIMAL(10,2) GENERATED ALWAYS AS ((quantity * unit_price_ht * (1 - discount_percent/100)) * (1 + vat_rate/100)) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- =============================================
-- TABLE: messages (Messages internes liés aux entreprises)
-- =============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    prompt TEXT,
    response TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    source VARCHAR(20) DEFAULT 'website' CHECK (source IN ('website', 'email', 'phone', 'other')),
    tags JSONB DEFAULT '[]',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    replied_at TIMESTAMP
);

CREATE INDEX idx_messages_company_id ON messages(company_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_email ON messages(email);

-- =============================================
-- TABLE: message_replies
-- =============================================
CREATE TABLE message_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_customer BOOLEAN DEFAULT false,
    author_name VARCHAR(255) NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_replies_message_id ON message_replies(message_id);

-- =============================================
-- TABLE: publications (Publications liées aux entreprises)
-- =============================================
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500),
    featured_image TEXT,
    images TEXT[],
    hashtags TEXT[],
    type VARCHAR(50) DEFAULT 'standard' CHECK (type IN ('standard', 'promotion', 'event', 'announcement', 'tutorial')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    category VARCHAR(100),
    tags TEXT[],
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    slug VARCHAR(255) NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique slug par entreprise
    UNIQUE(company_id, slug)
);

CREATE INDEX idx_publications_company_id ON publications(company_id);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_category ON publications(category);
CREATE INDEX idx_publications_published_at ON publications(published_at);
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_created_at ON publications(created_at);

-- =============================================
-- TABLE: publication_platforms
-- =============================================
CREATE TABLE publication_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'website')),
    platform_post_id VARCHAR(255), -- ID du post sur la plateforme
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    error_message TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB, -- Likes, shares, comments, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(publication_id, platform)
);

CREATE INDEX idx_publication_platforms_publication_id ON publication_platforms(publication_id);
CREATE INDEX idx_publication_platforms_platform ON publication_platforms(platform);
CREATE INDEX idx_publication_platforms_status ON publication_platforms(status);

-- =============================================
-- TABLE: availability_rules (Règles de disponibilité liées aux entreprises)
-- =============================================
CREATE TABLE availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=dimanche, 6=samedi
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons de jour par entreprise
    UNIQUE(company_id, day_of_week)
);

CREATE INDEX idx_availability_rules_company_id ON availability_rules(company_id);
CREATE INDEX idx_availability_rules_day_of_week ON availability_rules(day_of_week);
CREATE INDEX idx_availability_rules_is_active ON availability_rules(is_active);

-- =============================================
-- TABLE: appointments (Rendez-vous liés aux entreprises)
-- =============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    google_event_id VARCHAR(255), -- ID de l'événement Google Calendar
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte pour éviter les créneaux en double par entreprise
    UNIQUE(company_id, date, start_time)
);

CREATE INDEX idx_appointments_company_id ON appointments(company_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_client_email ON appointments(client_email);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);
CREATE INDEX idx_appointments_google_event_id ON appointments(google_event_id);

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
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_platforms_updated_at BEFORE UPDATE ON publication_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_rules_updated_at BEFORE UPDATE ON availability_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour générer un numéro de devis par entreprise
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

-- Fonction pour générer un numéro de facture par entreprise
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

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue des statistiques dashboard par entreprise
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    c.id as company_id,
    (SELECT COUNT(*) FROM clients WHERE company_id = c.id AND status = 'active') as active_clients,
    (SELECT COUNT(*) FROM clients WHERE company_id = c.id AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_month,
    (SELECT COUNT(*) FROM contact_messages WHERE company_id = c.id AND status = 'unread') as unread_messages,
    (SELECT COUNT(*) FROM quotes WHERE company_id = c.id AND status = 'sent') as pending_quotes,
    (SELECT COUNT(*) FROM invoices WHERE company_id = c.id AND status = 'overdue') as overdue_invoices,
    (SELECT COALESCE(SUM(total_ttc), 0) FROM invoices WHERE company_id = c.id AND status = 'paid' AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE)) as revenue_month,
    (SELECT COUNT(*) FROM publications WHERE company_id = c.id AND status = 'published') as published_publications
FROM companies c;

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Entreprise de démonstration
INSERT INTO companies (id, name, legal_name, siret, email, phone, address_line1, city, postal_code, country, subscription_plan, max_users, max_clients) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Jeroka Demo',
    'Jeroka Demo SARL',
    '12345678901234',
    'contact@jeroka-demo.com',
    '+33123456789',
    '123 Rue de la Démo',
    'Paris',
    '75001',
    'France',
    'premium',
    50,
    1000
) ON CONFLICT (id) DO NOTHING;

-- Utilisateur admin par défaut (password: admin123)
INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, is_company_admin, email_verified) 
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'admin@jeroka-demo.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdhXmzdZk2bEW3u',
    'Admin', 
    'Jeroka', 
    'admin', 
    true,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Utilisateur manager de test (password: manager123)
INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, is_company_admin, email_verified) 
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'manager@jeroka-demo.com', 
    '$2a$12$8K9LxQrBg.xQ9QJzxK8rLeJ2TQJpQzCzK9Y.MgQJpL8XqZrK8Y.ZS',
    'Manager', 
    'Jeroka', 
    'manager', 
    true,
    false,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample messages for testing
INSERT INTO messages (id, company_id, first_name, last_name, email, phone, company, subject, message, status, priority, source, created_at) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@email.com', '+33123456789', 'Entreprise ABC', 'Demande de devis site web', 'Bonjour, je souhaiterais avoir un devis pour la création d''un site web e-commerce. Merci.', 'new', 'high', 'website', NOW() - INTERVAL '2 hours'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Marie', 'Martin', 'marie.martin@email.com', '+33987654321', 'StartupXYZ', 'Question sur vos services', 'Bonjour, pouvez-vous me dire si vous proposez de l''hébergement web ? Cordialement.', 'read', 'medium', 'website', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Pierre', 'Bernard', 'pierre.bernard@email.com', null, null, 'Problème technique', 'Mon site web ne fonctionne plus depuis ce matin. Pouvez-vous m''aider ?', 'replied', 'high', 'email', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;