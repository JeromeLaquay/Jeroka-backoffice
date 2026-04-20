-- Clients / contacts (sans FK cross-base vers companies ; company_id logique).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE persons (
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

CREATE INDEX idx_crm_persons_company_id ON persons(company_id);
CREATE INDEX idx_crm_persons_email ON persons(email);
CREATE INDEX idx_crm_persons_status ON persons(status);
