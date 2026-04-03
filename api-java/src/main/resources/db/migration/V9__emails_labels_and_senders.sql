-- =============================================
-- EMAILS: préférences par libellé + expéditeurs
-- =============================================

CREATE TABLE IF NOT EXISTS email_label_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label_id VARCHAR(255) NOT NULL,
    download_attachments BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, label_id)
);

ALTER TABLE email_label_preferences
    ADD COLUMN IF NOT EXISTS label_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS download_attachments BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_email_label_preferences_user_id ON email_label_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_label_preferences_label_id ON email_label_preferences(label_id);

CREATE TABLE IF NOT EXISTS email_senders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    label_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

ALTER TABLE email_senders
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS label_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_email_senders_user_id ON email_senders(user_id);
CREATE INDEX IF NOT EXISTS idx_email_senders_label_id ON email_senders(label_id);
CREATE INDEX IF NOT EXISTS idx_email_senders_email ON email_senders(email);

