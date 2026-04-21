-- Identifiants réseaux sociaux (même périmètre que le monolithe ; pas de FK user_id : utilisateurs hors de cette base).
CREATE TABLE company_social_credentials (
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

CREATE INDEX idx_org_company_social_user_id ON company_social_credentials (user_id);
CREATE INDEX idx_org_company_social_platform ON company_social_credentials (platform);
CREATE INDEX idx_org_company_social_active ON company_social_credentials (is_active);
