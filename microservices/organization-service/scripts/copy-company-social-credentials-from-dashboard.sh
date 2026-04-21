#!/usr/bin/env bash
# Copie company_social_credentials depuis jeroka_dashboard vers jeroka_organization
# (lignes dont company_id existe déjà dans jeroka_organization.companies).
# Prérequis : copy-companies-from-dashboard.sh exécuté avant.
# Usage : bash microservices/organization-service/scripts/copy-company-social-credentials-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_ORG_SOCIAL_CREDENTIALS:-0}" = "1" ]; then
  echo "REPLACE_ORG_SOCIAL_CREDENTIALS=1 : TRUNCATE jeroka_organization.company_social_credentials"
  "${PSQL_BASE[@]}" -d jeroka_organization -c "TRUNCATE company_social_credentials"
fi

"${PSQL_BASE[@]}" -d jeroka_organization -c "
INSERT INTO company_social_credentials (
  id, user_id, company_id, platform, encrypted_credentials, is_active,
  expires_at, last_used_at, created_at, updated_at
)
SELECT
  c.id, c.user_id, c.company_id, c.platform, c.encrypted_credentials, COALESCE(c.is_active, true),
  c.expires_at::timestamptz, c.last_used_at::timestamptz,
  COALESCE(c.created_at, now())::timestamptz, COALESCE(c.updated_at, now())::timestamptz
FROM jeroka_dashboard.company_social_credentials c
WHERE c.company_id IN (SELECT id FROM jeroka_organization.companies)
ON CONFLICT (id) DO NOTHING;
"

echo "Copie company_social_credentials terminée."
