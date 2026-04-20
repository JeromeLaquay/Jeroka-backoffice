-- Messages de contact (sans FK vers companies ; person_id → persons dans jeroka_crm).
CREATE TABLE messages (
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

CREATE INDEX idx_crm_messages_company_id ON messages(company_id);
CREATE INDEX idx_crm_messages_status ON messages(status);
CREATE INDEX idx_crm_messages_priority ON messages(priority);
CREATE INDEX idx_crm_messages_created_at ON messages(created_at);
CREATE INDEX idx_crm_messages_email ON messages(email);
