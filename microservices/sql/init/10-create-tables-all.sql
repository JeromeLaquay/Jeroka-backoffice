-- Exécuter après 00-create-databases.sql
-- Exemple :
-- psql -U postgres -d postgres -f microservices/sql/init/10-create-tables-all.sql

\connect jeroka_auth
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS auth_signing_keys (
  kid VARCHAR(128) PRIMARY KEY,
  public_pem TEXT NOT NULL,
  private_pem TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_signing_keys_status_created ON auth_signing_keys (status, created_at DESC);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

\connect jeroka_organization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  siret VARCHAR(14),
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
  size VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  max_users INTEGER DEFAULT 5,
  max_persons INTEGER DEFAULT 100,
  max_storage_mb INTEGER DEFAULT 1000,
  settings JSONB DEFAULT '{}',
  billing_info JSONB DEFAULT '{}',
  google_calendar_id VARCHAR(255),
  google_mail_id VARCHAR(255),
  google_drive_folder_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_org_companies_siret ON companies(siret);
CREATE INDEX IF NOT EXISTS idx_org_companies_status ON companies(status);
CREATE TABLE IF NOT EXISTS company_social_credentials (
  id UUID PRIMARY KEY,
  user_id UUID,
  company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  encrypted_credentials JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_org_social_platform CHECK (platform IN ('meta', 'linkedin', 'twitter', 'site web', 'google'))
);
CREATE INDEX IF NOT EXISTS idx_org_company_social_user_id ON company_social_credentials (user_id);
CREATE INDEX IF NOT EXISTS idx_org_company_social_platform ON company_social_credentials (platform);
CREATE INDEX IF NOT EXISTS idx_org_company_social_active ON company_social_credentials (is_active);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  google_calendar_id VARCHAR(255),
  google_mail_id VARCHAR(255),
  google_drive_folder_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  is_company_admin BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMPTZ,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
CREATE INDEX IF NOT EXISTS idx_org_users_company_id ON users (company_id);
CREATE INDEX IF NOT EXISTS idx_org_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_org_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_org_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_org_users_is_company_admin ON users (is_company_admin);

\connect jeroka_crm
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  type VARCHAR(20) DEFAULT 'client',
  type_client VARCHAR(20) DEFAULT 'individual',
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
  status VARCHAR(20) DEFAULT 'active',
  source VARCHAR(50),
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
CREATE INDEX IF NOT EXISTS idx_crm_persons_company_id ON persons(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_persons_email ON persons(email);
CREATE INDEX IF NOT EXISTS idx_crm_persons_status ON persons(status);
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  prompt TEXT,
  response TEXT,
  status VARCHAR(20) DEFAULT 'new',
  priority VARCHAR(10) DEFAULT 'medium',
  source VARCHAR(20) DEFAULT 'website',
  tags JSONB DEFAULT '[]',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  person_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_crm_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_crm_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_crm_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_messages_email ON messages(email);

\connect jeroka_catalog
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  price_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  vat_number DECIMAL(5, 2) DEFAULT 20.00,
  cost_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'pièce',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_catalog_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_is_active ON products(is_active);

\connect jeroka_billing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  quote_number VARCHAR(50) NOT NULL,
  person_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  title VARCHAR(255),
  description TEXT,
  subtotal_ht DECIMAL(10, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_ht DECIMAL(10, 2) DEFAULT 0,
  total_vat DECIMAL(10, 2) DEFAULT 0,
  total_ttc DECIMAL(10, 2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  payment_terms VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, quote_number)
);
CREATE INDEX IF NOT EXISTS idx_billing_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_quotes_person ON quotes(person_id);
CREATE INDEX IF NOT EXISTS idx_billing_quotes_status ON quotes(status);
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  quote_id UUID,
  person_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  title VARCHAR(255),
  description TEXT,
  subtotal_ht DECIMAL(10, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_ht DECIMAL(10, 2) DEFAULT 0,
  total_vat DECIMAL(10, 2) DEFAULT 0,
  total_ttc DECIMAL(10, 2) DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) DEFAULT 0,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_terms VARCHAR(255),
  payment_method VARCHAR(50),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_person ON invoices(person_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON invoices(status);

\connect jeroka_scheduling
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  person_id UUID,
  google_event_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sched_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_sched_appointments_person ON appointments(person_id);
CREATE INDEX IF NOT EXISTS idx_sched_appointments_start ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_sched_appointments_status ON appointments(status);

\connect jeroka_content
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  featured_image TEXT,
  type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'draft',
  category VARCHAR(100),
  slug VARCHAR(255) NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_content_publications_company ON publications(company_id);
CREATE INDEX IF NOT EXISTS idx_content_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_content_publications_slug ON publications(slug);

\connect jeroka_email
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS email_label_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label_id VARCHAR(255) NOT NULL,
  download_attachments BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_email_label_pref_user_label UNIQUE (user_id, label_id)
);
CREATE INDEX IF NOT EXISTS idx_email_label_preferences_user_id ON email_label_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_label_preferences_label_id ON email_label_preferences(label_id);
CREATE TABLE IF NOT EXISTS email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  label_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_email_senders_user_email UNIQUE (user_id, email)
);
CREATE INDEX IF NOT EXISTS idx_email_senders_user_id ON email_senders(user_id);
CREATE INDEX IF NOT EXISTS idx_email_senders_label_id ON email_senders(label_id);
CREATE INDEX IF NOT EXISTS idx_email_senders_email ON email_senders(email);
CREATE TABLE IF NOT EXISTS email_sync_jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  status VARCHAR(32) NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  mode VARCHAR(32),
  count_limit INTEGER,
  date_from VARCHAR(32),
  date_to VARCHAR(32),
  include_attachments BOOLEAN,
  auto_analyze BOOLEAN,
  new_emails INTEGER,
  downloaded_attachments INTEGER,
  unique_senders INTEGER
);
CREATE INDEX IF NOT EXISTS idx_email_sync_jobs_user_id ON email_sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sync_jobs_status ON email_sync_jobs(status);

\connect jeroka_audit
CREATE TABLE IF NOT EXISTS history_logs (
  id UUID PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  event_id UUID,
  correlation_id VARCHAR(255),
  payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_history_logs_topic_created ON history_logs (topic, created_at DESC);
