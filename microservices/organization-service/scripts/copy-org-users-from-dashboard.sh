#!/usr/bin/env bash
# Copie jeroka_dashboard.users vers jeroka_organization.users (entreprises déjà copiées).
# Prérequis : copy-companies-from-dashboard.sh (et idéalement copy-company-social-credentials si besoin).
# Usage : bash microservices/organization-service/scripts/copy-org-users-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_ORG_USERS:-0}" = "1" ]; then
  echo "REPLACE_ORG_USERS=1 : TRUNCATE jeroka_organization.users"
  "${PSQL_BASE[@]}" -d jeroka_organization -c "TRUNCATE users CASCADE"
fi

"${PSQL_BASE[@]}" -d jeroka_organization -c "
INSERT INTO users (
  id, company_id, email, password_hash, first_name, last_name, phone, avatar_url,
  google_calendar_id, google_mail_id, google_drive_folder_id, role, is_active, is_company_admin,
  last_login, email_verified, email_verification_token, password_reset_token, password_reset_expires,
  permissions, created_at, updated_at
)
SELECT
  u.id, u.company_id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.avatar_url,
  u.google_calendar_id, u.google_mail_id, u.google_drive_folder_id, u.role, COALESCE(u.is_active, true),
  COALESCE(u.is_company_admin, false),
  u.last_login::timestamptz, COALESCE(u.email_verified, false), u.email_verification_token,
  u.password_reset_token, u.password_reset_expires::timestamptz,
  COALESCE(u.permissions, '{}'::jsonb),
  COALESCE(u.created_at, now())::timestamptz, COALESCE(u.updated_at, now())::timestamptz
FROM jeroka_dashboard.users u
WHERE u.company_id IN (SELECT id FROM jeroka_organization.companies)
ON CONFLICT (id) DO NOTHING;
"

echo "Copie users (organization) terminée."
