-- Seed minimal de demonstration (idempotent).
-- Exemple:
-- psql -U postgres -d postgres -f microservices/sql/seed/10-seed-dev-data.sql

\connect jeroka_auth
INSERT INTO auth_signing_keys (kid, public_pem, private_pem, status)
VALUES ('dev-kid-1', 'dev-public-key', 'dev-private-key', 'ACTIVE')
ON CONFLICT (kid) DO NOTHING;

INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active)
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'admin@jeroka.local', '$2a$10$devhashplaceholder', 'Admin', 'Jeroka', 'admin', true)
ON CONFLICT (id) DO NOTHING;

\connect jeroka_organization
INSERT INTO companies (id, name, legal_name, status, subscription_plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Jeroka Demo', 'Jeroka Demo SAS', 'active', 'pro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_active, is_company_admin)
VALUES ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'admin@jeroka.local', '$2a$10$devhashplaceholder', 'Admin', 'Jeroka', 'admin', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO company_social_credentials (id, user_id, company_id, platform, encrypted_credentials, is_active)
VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'google', '{"oauthClientId":"demo-client","oauthClientSecret":"demo-secret","refreshToken":"demo-refresh-token","redirectUri":"http://localhost:3000/api/v1/settings/google/callback"}', true)
ON CONFLICT (id) DO NOTHING;

\connect jeroka_crm
INSERT INTO persons (id, company_id, type, first_name, last_name, email, status)
VALUES ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'client', 'Jean', 'Client', 'jean.client@demo.local', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (id, company_id, first_name, last_name, email, subject, message, status, source, person_id)
VALUES ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Jean', 'Client', 'jean.client@demo.local', 'Demande de devis', 'Bonjour, je souhaite un devis.', 'new', 'website', '00000000-0000-0000-0000-000000000301')
ON CONFLICT (id) DO NOTHING;

\connect jeroka_catalog
INSERT INTO products (id, company_id, name, sku, category, price_ht, vat_number, is_active)
VALUES ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'Prestation Conseil', 'PREST-001', 'Services', 100.00, 20.00, true)
ON CONFLICT (id) DO NOTHING;

\connect jeroka_billing
INSERT INTO quotes (id, company_id, quote_number, person_id, status, title, total_ttc)
VALUES ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'DV-2026-0001', '00000000-0000-0000-0000-000000000301', 'sent', 'Devis demo', 120.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, company_id, invoice_number, quote_id, person_id, status, title, total_ttc, amount_due)
VALUES ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'FAC-2026-0001', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000301', 'sent', 'Facture demo', 120.00, 120.00)
ON CONFLICT (id) DO NOTHING;

\connect jeroka_scheduling
INSERT INTO appointments (id, user_id, person_id, status, start_time, end_time, notes)
VALUES ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'pending', now() + interval '1 day', now() + interval '1 day 1 hour', 'Rendez-vous demo')
ON CONFLICT (id) DO NOTHING;

\connect jeroka_content
INSERT INTO publications (id, company_id, title, content, status, slug)
VALUES ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', 'Bienvenue sur Jeroka', 'Publication de demonstration.', 'draft', 'bienvenue-jeroka')
ON CONFLICT (id) DO NOTHING;

\connect jeroka_email
INSERT INTO email_senders (id, user_id, email, name)
VALUES ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000101', 'contact@demo.local', 'Contact Demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_label_preferences (id, user_id, label_id, download_attachments)
VALUES ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000101', 'INBOX', true)
ON CONFLICT (id) DO NOTHING;

\connect jeroka_audit
INSERT INTO history_logs (id, topic, event_id, correlation_id, payload)
VALUES ('00000000-0000-0000-0000-000000000901', 'jeroka.demo.seed', '00000000-0000-0000-0000-000000000901', 'seed-demo', '{"message":"seed initialise"}')
ON CONFLICT (id) DO NOTHING;
