#!/usr/bin/env bash
# Copie les lignes users de jeroka_dashboard vers jeroka_auth (CSV via pipe, même conteneur Postgres).
# Usage depuis la racine du dépôt : bash microservices/auth-service/scripts/copy-users-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_AUTH_USERS:-0}" = "1" ]; then
  echo "REPLACE_AUTH_USERS=1 : TRUNCATE jeroka_auth.users (+ refresh_tokens)."
  "${PSQL_BASE[@]}" -d jeroka_auth -c "TRUNCATE refresh_tokens, users RESTART IDENTITY CASCADE"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (SELECT id, company_id, email, password_hash, first_name, last_name,
                COALESCE(NULLIF(btrim(role), ''), 'user') AS role,
                COALESCE(is_active, true) AS is_active,
                COALESCE(created_at, now()) AS created_at,
                COALESCE(updated_at, now()) AS updated_at
         FROM users) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_auth -c \
  "COPY users (id, company_id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at) FROM STDIN WITH CSV"

echo "Copie terminée."
