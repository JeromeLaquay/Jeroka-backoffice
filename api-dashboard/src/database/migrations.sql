-- =============================================
-- JEROKA DASHBOARD - SCHEMA DE BASE DE DONNÉES
-- =============================================

-- Suppression des tables existantes (ordre inverse des dépendances)
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
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

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
-- TABLE: clients
-- =============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_company_name ON clients(company_name);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- =============================================
-- TABLE: contact_messages
-- =============================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'other' CHECK (type IN ('devis', 'information', 'partnership', 'support', 'other')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id), -- Lien vers client si existant
    ip_address INET,
    user_agent TEXT,
    source VARCHAR(100), -- Page/formulaire d'origine
    tags TEXT[],
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_type ON contact_messages(type);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_priority ON contact_messages(priority);

-- =============================================
-- TABLE: products
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
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
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_price_ht ON products(price_ht);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);

-- =============================================
-- TABLE: quotes (Devis)
-- =============================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
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
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    total_vat DECIMAL(10,2) GENERATED ALWAYS AS (total_ht * vat_rate/100) STORED,
    total_ttc DECIMAL(10,2) GENERATED ALWAYS AS (total_ht + total_vat) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);

-- =============================================
-- TABLE: invoices (Factures)
-- =============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
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
    amount_due DECIMAL(10,2) GENERATED ALWAYS AS (total_ttc - amount_paid) STORED,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_terms VARCHAR(255),
    payment_method VARCHAR(50),
    bank_details TEXT,
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    total_vat DECIMAL(10,2) GENERATED ALWAYS AS (total_ht * vat_rate/100) STORED,
    total_ttc DECIMAL(10,2) GENERATED ALWAYS AS (total_ht + total_vat) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- =============================================
-- TABLE: publications
-- =============================================
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    slug VARCHAR(255) UNIQUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_platforms_updated_at BEFORE UPDATE ON publication_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour générer un numéro de devis
CREATE OR REPLACE FUNCTION generate_quote_number() 
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
    WHERE quote_number LIKE 'DV' || year_suffix || '-%';
    
    quote_number := 'DV' || year_suffix || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number() 
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
    WHERE invoice_number LIKE 'FA' || year_suffix || '-%';
    
    invoice_number := 'FA' || year_suffix || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue des statistiques dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
    (SELECT COUNT(*) FROM clients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_clients_month,
    (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread') as unread_messages,
    (SELECT COUNT(*) FROM quotes WHERE status = 'sent') as pending_quotes,
    (SELECT COUNT(*) FROM invoices WHERE status = 'overdue') as overdue_invoices,
    (SELECT COALESCE(SUM(total_ttc), 0) FROM invoices WHERE status = 'paid' AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE)) as revenue_month,
    (SELECT COUNT(*) FROM publications WHERE status = 'published') as published_publications;

-- =============================================
-- DONNÉES DE TEST (SEED)
-- =============================================

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Utilisateur admin par défaut (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) 
VALUES (
    'admin@jeroka.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdhXmzdZk2bEW3u',
    'Admin', 
    'Jeroka', 
    'admin', 
    true, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Utilisateur manager de test (password: manager123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) 
VALUES (
    'manager@jeroka.com', 
    '$2a$12$8K9LxQrBg.xQ9QJzxK8rLeJ2TQJpQzCzK9Y.MgQJpL8XqZrK8Y.ZS',
    'Manager', 
    'Jeroka', 
    'manager', 
    true, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Utilisateur standard de test (password: user123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) 
VALUES (
    'user@jeroka.com', 
    '$2a$12$9K8LxQrBg.xQ9QJzxK8rLeJ2TQJpQzCzK9Y.MgQJpL8XqZrK8Y.ZT',
    'User', 
    'Jeroka', 
    'user', 
    true, 
    true
) ON CONFLICT (email) DO NOTHING;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  source VARCHAR(20) DEFAULT 'website' CHECK (source IN ('website', 'email', 'phone', 'other')),
  tags JSONB DEFAULT '[]',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  replied_at TIMESTAMP
);

-- Message replies table
CREATE TABLE IF NOT EXISTS message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_from_customer BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_assigned_to ON messages(assigned_to);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON message_replies(message_id);

-- Insert sample messages for testing
INSERT INTO messages (id, first_name, last_name, email, phone, company, subject, message, status, priority, source, created_at) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Jean', 'Dupont', 'jean.dupont@email.com', '+33123456789', 'Entreprise ABC', 'Demande de devis site web', 'Bonjour, je souhaiterais avoir un devis pour la création d''un site web e-commerce. Merci.', 'new', 'high', 'website', NOW() - INTERVAL '2 hours'),
  ('55555555-5555-5555-5555-555555555555', 'Marie', 'Martin', 'marie.martin@email.com', '+33987654321', 'StartupXYZ', 'Question sur vos services', 'Bonjour, pouvez-vous me dire si vous proposez de l''hébergement web ? Cordialement.', 'read', 'medium', 'website', NOW() - INTERVAL '1 day'),
  ('66666666-6666-6666-6666-666666666666', 'Pierre', 'Bernard', 'pierre.bernard@email.com', null, null, 'Problème technique', 'Mon site web ne fonctionne plus depuis ce matin. Pouvez-vous m''aider ?', 'replied', 'high', 'email', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
