#!/usr/bin/env bash
# Copie la table persons depuis jeroka_dashboard vers jeroka_crm (CSV).
# Usage : bash microservices/crm-service/scripts/copy-persons-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_CRM_PERSONS:-0}" = "1" ]; then
  echo "REPLACE_CRM_PERSONS=1 : TRUNCATE jeroka_crm.persons"
  "${PSQL_BASE[@]}" -d jeroka_crm -c "TRUNCATE persons CASCADE"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (SELECT * FROM persons) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_crm -c \
  "COPY persons FROM STDIN WITH CSV"

echo "Copie persons terminée."
