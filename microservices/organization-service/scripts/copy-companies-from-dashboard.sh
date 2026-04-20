#!/usr/bin/env bash
# Copie la table companies depuis jeroka_dashboard vers jeroka_organization (CSV).
# Usage : bash microservices/organization-service/scripts/copy-companies-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_ORG_COMPANIES:-0}" = "1" ]; then
  echo "REPLACE_ORG_COMPANIES=1 : TRUNCATE jeroka_organization.companies"
  "${PSQL_BASE[@]}" -d jeroka_organization -c "TRUNCATE companies CASCADE"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (SELECT * FROM companies) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_organization -c \
  "COPY companies FROM STDIN WITH CSV"

echo "Copie companies terminée."
