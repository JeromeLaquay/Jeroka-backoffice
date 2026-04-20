#!/usr/bin/env bash
# Copie appointments depuis jeroka_dashboard vers jeroka_scheduling.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_SCHEDULING_APPOINTMENTS:-0}" = "1" ]; then
  echo "REPLACE_SCHEDULING_APPOINTMENTS=1 : TRUNCATE jeroka_scheduling.appointments"
  "${PSQL_BASE[@]}" -d jeroka_scheduling -c "TRUNCATE appointments"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (
    SELECT id, user_id, person_id, google_event_id, status, start_time, end_time, notes,
           COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
    FROM appointments
  ) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_scheduling -c \
  "COPY appointments (
    id, user_id, person_id, google_event_id, status, start_time, end_time, notes, created_at, updated_at
  ) FROM STDIN WITH CSV"

echo "Copie appointments terminée."
