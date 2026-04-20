-- Migration SQL des donnees depuis jeroka_dashboard vers les bases microservices.
-- Le script est "best effort": si une table source est absente, il passe a la suite.
-- Prerequis:
-- 1) Bases et tables cible creees
-- 2) Extension dblink disponible
-- Exemple:
-- psql -U postgres -d postgres -f microservices/sql/migrate/10-copy-from-jeroka-dashboard.sql

\connect jeroka_auth
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('users') THEN
    INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, company_id, email, password_hash, first_name, last_name,
             COALESCE(NULLIF(btrim(role), ''), 'user') AS role,
             COALESCE(is_active, true) AS is_active,
             COALESCE(created_at, now()) AS created_at,
             COALESCE(updated_at, created_at, now()) AS updated_at
      FROM users
    $q$) AS src(
      id UUID, company_id UUID, email VARCHAR(255), password_hash VARCHAR(255),
      first_name VARCHAR(100), last_name VARCHAR(100), role VARCHAR(50),
      is_active BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "users" absente dans jeroka_dashboard (auth skip)';
  END IF;
END $$;

\connect jeroka_organization
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('companies') THEN
    INSERT INTO companies
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$ SELECT * FROM companies $q$) AS src(
      id UUID, name VARCHAR(255), legal_name VARCHAR(255), siret VARCHAR(14), vat_number VARCHAR(50),
      address_line1 VARCHAR(255), address_line2 VARCHAR(255), city VARCHAR(100), postal_code VARCHAR(20),
      country VARCHAR(100), phone VARCHAR(20), email VARCHAR(255), website VARCHAR(255), logo_url TEXT,
      description TEXT, industry VARCHAR(100), size VARCHAR(50), status VARCHAR(20), subscription_plan VARCHAR(50),
      subscription_expires_at TIMESTAMPTZ, max_users INTEGER, max_persons INTEGER, max_storage_mb INTEGER,
      settings JSONB, billing_info JSONB, google_calendar_id VARCHAR(255), google_mail_id VARCHAR(255),
      google_drive_folder_id VARCHAR(255), created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "companies" absente dans jeroka_dashboard (organization companies skip)';
  END IF;

  IF __src_table_exists('company_social_credentials') THEN
    INSERT INTO company_social_credentials (id, user_id, company_id, platform, encrypted_credentials, is_active, expires_at, last_used_at, created_at, updated_at)
    SELECT c.id, c.user_id, c.company_id, c.platform, c.encrypted_credentials, COALESCE(c.is_active, true), c.expires_at, c.last_used_at, COALESCE(c.created_at, now()), COALESCE(c.updated_at, now())
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, user_id, company_id, platform, encrypted_credentials, is_active, expires_at, last_used_at, created_at, updated_at
      FROM company_social_credentials
    $q$) AS c(
      id UUID, user_id UUID, company_id UUID, platform VARCHAR(20), encrypted_credentials JSONB,
      is_active BOOLEAN, expires_at TIMESTAMPTZ, last_used_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    WHERE c.company_id IN (SELECT id FROM companies)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "company_social_credentials" absente (organization social skip)';
  END IF;

  IF __src_table_exists('users') THEN
    INSERT INTO users (
      id, company_id, email, password_hash, first_name, last_name, phone, avatar_url,
      google_calendar_id, google_mail_id, google_drive_folder_id, role, is_active, is_company_admin,
      last_login, email_verified, email_verification_token, password_reset_token, password_reset_expires,
      permissions, created_at, updated_at
    )
    SELECT
      u.id, u.company_id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.avatar_url,
      u.google_calendar_id, u.google_mail_id, u.google_drive_folder_id, u.role, COALESCE(u.is_active, true),
      COALESCE(u.is_company_admin, false), u.last_login, COALESCE(u.email_verified, false),
      u.email_verification_token, u.password_reset_token, u.password_reset_expires,
      COALESCE(u.permissions, '{}'::jsonb), COALESCE(u.created_at, now()), COALESCE(u.updated_at, now())
    FROM dblink('dbname=jeroka_dashboard', $q$ SELECT * FROM users $q$) AS u(
      id UUID, company_id UUID, email VARCHAR(255), password_hash VARCHAR(255), first_name VARCHAR(100), last_name VARCHAR(100),
      phone VARCHAR(20), avatar_url TEXT, google_calendar_id VARCHAR(255), google_mail_id VARCHAR(255), google_drive_folder_id VARCHAR(255),
      role VARCHAR(50), is_active BOOLEAN, is_company_admin BOOLEAN, last_login TIMESTAMPTZ, email_verified BOOLEAN,
      email_verification_token VARCHAR(255), password_reset_token VARCHAR(255), password_reset_expires TIMESTAMPTZ,
      permissions JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    WHERE u.company_id IN (SELECT id FROM companies)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "users" absente (organization users skip)';
  END IF;
END $$;

\connect jeroka_crm
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('persons') THEN
    INSERT INTO persons
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$ SELECT * FROM persons $q$) AS src(
      id UUID, company_id UUID, type VARCHAR(20), type_client VARCHAR(20), first_name VARCHAR(100), last_name VARCHAR(100),
      company_name VARCHAR(200), email VARCHAR(255), phone VARCHAR(20), mobile VARCHAR(20), address_line1 VARCHAR(255),
      address_line2 VARCHAR(255), city VARCHAR(100), postal_code VARCHAR(20), country VARCHAR(100), siret VARCHAR(14),
      vat_number VARCHAR(50), website VARCHAR(255), notes TEXT, avatar_url TEXT, status VARCHAR(20), source VARCHAR(50),
      tags TEXT[], custom_fields JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "persons" absente (crm persons skip)';
  END IF;

  IF __src_table_exists('messages') THEN
    INSERT INTO messages
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$ SELECT * FROM messages $q$) AS src(
      id UUID, company_id UUID, first_name VARCHAR(100), last_name VARCHAR(100), email VARCHAR(255), phone VARCHAR(20),
      company VARCHAR(255), subject VARCHAR(500), message TEXT, prompt TEXT, response TEXT, status VARCHAR(20),
      priority VARCHAR(10), source VARCHAR(20), tags JSONB, ip_address INET, user_agent TEXT, referrer TEXT,
      person_id UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, read_at TIMESTAMPTZ, replied_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "messages" absente (crm messages skip)';
  END IF;
END $$;

\connect jeroka_catalog
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('products') THEN
    INSERT INTO products (
      id, company_id, name, description, short_description, sku, category, price_ht, vat_number,
      cost_price, stock_quantity, min_stock_level, unit, is_active, created_at, updated_at
    )
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, company_id, name, description, short_description, sku, category, price_ht, vat_number,
             cost_price, stock_quantity, min_stock_level, unit, COALESCE(is_active, true),
             COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
      FROM products
    $q$) AS src(
      id UUID, company_id UUID, name VARCHAR(255), description TEXT, short_description VARCHAR(500), sku VARCHAR(100),
      category VARCHAR(100), price_ht DECIMAL(10,2), vat_number DECIMAL(5,2), cost_price DECIMAL(10,2),
      stock_quantity INTEGER, min_stock_level INTEGER, unit VARCHAR(20), is_active BOOLEAN,
      created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "products" absente (catalog skip)';
  END IF;
END $$;

\connect jeroka_billing
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('quotes') THEN
    INSERT INTO quotes (
      id, company_id, quote_number, person_id, status, title, description, subtotal_ht, discount_percent,
      discount_amount, total_ht, total_vat, total_ttc, valid_until, notes, payment_terms, created_at, updated_at
    )
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, company_id, quote_number, person_id, status, title, description, subtotal_ht, discount_percent,
             discount_amount, total_ht, total_vat, total_ttc, valid_until, notes, payment_terms,
             COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
      FROM quotes
    $q$) AS src(
      id UUID, company_id UUID, quote_number VARCHAR(50), person_id UUID, status VARCHAR(20), title VARCHAR(255),
      description TEXT, subtotal_ht DECIMAL(10,2), discount_percent DECIMAL(5,2), discount_amount DECIMAL(10,2),
      total_ht DECIMAL(10,2), total_vat DECIMAL(10,2), total_ttc DECIMAL(10,2), valid_until DATE,
      notes TEXT, payment_terms VARCHAR(255), created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "quotes" absente (billing quotes skip)';
  END IF;

  IF __src_table_exists('invoices') THEN
    INSERT INTO invoices (
      id, company_id, invoice_number, quote_id, person_id, status, title, description, subtotal_ht,
      discount_percent, discount_amount, total_ht, total_vat, total_ttc, amount_paid, amount_due,
      issue_date, due_date, payment_terms, payment_method, notes, paid_at, created_at, updated_at
    )
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, company_id, invoice_number, quote_id, person_id, status, title, description, subtotal_ht,
             discount_percent, discount_amount, total_ht, total_vat, total_ttc, COALESCE(amount_paid, 0),
             COALESCE(amount_due, 0), issue_date, due_date, payment_terms, payment_method, notes, paid_at,
             COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
      FROM invoices
    $q$) AS src(
      id UUID, company_id UUID, invoice_number VARCHAR(50), quote_id UUID, person_id UUID, status VARCHAR(20),
      title VARCHAR(255), description TEXT, subtotal_ht DECIMAL(10,2), discount_percent DECIMAL(5,2),
      discount_amount DECIMAL(10,2), total_ht DECIMAL(10,2), total_vat DECIMAL(10,2), total_ttc DECIMAL(10,2),
      amount_paid DECIMAL(10,2), amount_due DECIMAL(10,2), issue_date DATE, due_date DATE,
      payment_terms VARCHAR(255), payment_method VARCHAR(50), notes TEXT, paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "invoices" absente (billing invoices skip)';
  END IF;
END $$;

\connect jeroka_scheduling
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('appointments') THEN
    INSERT INTO appointments (id, user_id, person_id, google_event_id, status, start_time, end_time, notes, created_at, updated_at)
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, user_id, person_id, google_event_id, status, start_time, end_time, notes,
             COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
      FROM appointments
    $q$) AS src(
      id UUID, user_id UUID, person_id UUID, google_event_id VARCHAR(255), status VARCHAR(20),
      start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "appointments" absente (scheduling skip)';
  END IF;
END $$;

\connect jeroka_content
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE OR REPLACE FUNCTION __src_table_exists(table_name TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  exists_in_source BOOLEAN;
BEGIN
  SELECT x.exists_flag
    INTO exists_in_source
    FROM dblink(
      'dbname=jeroka_dashboard',
      format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    ) AS x(exists_flag BOOLEAN);
  RETURN COALESCE(exists_in_source, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Verification table source "%" impossible: %', table_name, SQLERRM;
  RETURN FALSE;
END $$;

DO $$
BEGIN
  IF __src_table_exists('publications') THEN
    INSERT INTO publications (
      id, company_id, title, content, excerpt, featured_image, type, status, category, slug,
      view_count, like_count, share_count, scheduled_at, published_at, seo_title, seo_description, created_at, updated_at
    )
    SELECT *
    FROM dblink('dbname=jeroka_dashboard', $q$
      SELECT id, company_id, title, content, excerpt, featured_image, type, status, category, slug,
             COALESCE(view_count, 0), COALESCE(like_count, 0), COALESCE(share_count, 0),
             scheduled_at, published_at, seo_title, seo_description,
             COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
      FROM publications
    $q$) AS src(
      id UUID, company_id UUID, title VARCHAR(255), content TEXT, excerpt VARCHAR(500), featured_image TEXT,
      type VARCHAR(50), status VARCHAR(20), category VARCHAR(100), slug VARCHAR(255),
      view_count INTEGER, like_count INTEGER, share_count INTEGER, scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ, seo_title VARCHAR(255), seo_description TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Table source "publications" absente (content skip)';
  END IF;
END $$;
