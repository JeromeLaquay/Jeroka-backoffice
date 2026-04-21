-- Schéma email isolé (sans FK vers users : l'UUID utilisateur est une référence logique au core).

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
