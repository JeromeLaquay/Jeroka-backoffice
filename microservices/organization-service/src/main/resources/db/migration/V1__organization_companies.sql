-- Table companies (même périmètre fonctionnel que le monolithe pour GET/PUT /api/v1/company).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
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

CREATE INDEX idx_org_companies_name ON companies(name);
CREATE INDEX idx_org_companies_siret ON companies(siret);
CREATE INDEX idx_org_companies_status ON companies(status);
