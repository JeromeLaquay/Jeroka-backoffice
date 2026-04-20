CREATE TABLE auth_signing_keys (
    kid VARCHAR(128) PRIMARY KEY,
    public_pem TEXT NOT NULL,
    private_pem TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_signing_keys_status_created ON auth_signing_keys (status, created_at DESC);
