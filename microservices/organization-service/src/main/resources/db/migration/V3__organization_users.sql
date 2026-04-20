-- Utilisateurs d’entreprise (même schéma fonctionnel que jeroka_dashboard.users).
CREATE TABLE users (
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

CREATE INDEX idx_org_users_company_id ON users (company_id);
CREATE INDEX idx_org_users_email ON users (email);
CREATE INDEX idx_org_users_role ON users (role);
CREATE INDEX idx_org_users_is_active ON users (is_active);
CREATE INDEX idx_org_users_is_company_admin ON users (is_company_admin);
