#!/usr/bin/env bash
# Copie la table messages depuis jeroka_dashboard vers jeroka_crm (CSV).
# Exécuter après copy-persons-from-dashboard.sh si besoin d’intégrité person_id.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_CRM_MESSAGES:-0}" = "1" ]; then
  echo "REPLACE_CRM_MESSAGES=1 : TRUNCATE jeroka_crm.messages"
  "${PSQL_BASE[@]}" -d jeroka_crm -c "TRUNCATE messages CASCADE"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (SELECT * FROM messages) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_crm -c \
  "COPY messages FROM STDIN WITH CSV"

echo "Copie messages terminée."
