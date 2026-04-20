-- Jeton opaque OAuth : le callback Google n'envoie pas le JWT utilisateur.
CREATE TABLE oauth_google_state (
    state VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_oauth_google_state_created ON oauth_google_state (created_at);
