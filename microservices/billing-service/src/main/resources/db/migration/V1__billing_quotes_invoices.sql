-- Devis et factures (sans FK cross-base).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE quotes (
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

CREATE INDEX idx_billing_quotes_company ON quotes(company_id);
CREATE INDEX idx_billing_quotes_person ON quotes(person_id);
CREATE INDEX idx_billing_quotes_status ON quotes(status);

CREATE TABLE invoices (
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

CREATE INDEX idx_billing_invoices_company ON invoices(company_id);
CREATE INDEX idx_billing_invoices_person ON invoices(person_id);
CREATE INDEX idx_billing_invoices_status ON invoices(status);
