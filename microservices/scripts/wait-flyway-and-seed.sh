#!/bin/sh
# Attend que les tables Flyway existent puis exécute le seed idempotent.
set -eu

PGHOST="${PGHOST:-postgres}"
PGUSER="${PGUSER:-postgres}"
export PGPASSWORD="${PGPASSWORD:-postgres}"

has_table() {
  db="$1"
  tbl="$2"
  res="$(psql -q -t -A -d "$db" -c \
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tbl}' LIMIT 1;" \
    2>/dev/null || true)"
  [ "$res" = "1" ]
}

all_ready() {
  has_table jeroka_auth users \
    && has_table jeroka_organization users \
    && has_table jeroka_crm messages \
    && has_table jeroka_catalog products \
    && has_table jeroka_billing invoices \
    && has_table jeroka_scheduling appointments \
    && has_table jeroka_content publications \
    && has_table jeroka_email email_senders \
    && has_table jeroka_audit history_logs
}

echo "Attente des migrations Flyway (tables du seed)..."
i=0
while [ "$i" -lt 300 ]; do
  if all_ready; then
    echo "Tables OK, exécution du seed..."
    psql -v ON_ERROR_STOP=1 -d postgres -f /seed/10-seed-dev-data.sql
    echo "Seed terminé."
    exit 0
  fi
  i=$((i + 1))
  sleep 2
done

echo "Timeout: migrations Flyway incomplètes après 600 s."
exit 1
