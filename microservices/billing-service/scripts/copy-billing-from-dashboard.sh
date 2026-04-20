#!/usr/bin/env bash
# Copie quotes puis invoices depuis jeroka_dashboard vers jeroka_billing (CSV, colonnes alignées Flyway).
# Usage : bash microservices/billing-service/scripts/copy-billing-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_BILLING_DATA:-0}" = "1" ]; then
  echo "REPLACE_BILLING_DATA=1 : TRUNCATE jeroka_billing (invoices puis quotes)"
  "${PSQL_BASE[@]}" -d jeroka_billing -c "TRUNCATE invoices"
  "${PSQL_BASE[@]}" -d jeroka_billing -c "TRUNCATE quotes"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (
    SELECT id, company_id, quote_number, person_id, status, title, description,
           subtotal_ht, discount_percent, discount_amount, total_ht, total_vat, total_ttc,
           valid_until, notes, payment_terms,
           COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
    FROM quotes
  ) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_billing -c \
  "COPY quotes (
    id, company_id, quote_number, person_id, status, title, description,
    subtotal_ht, discount_percent, discount_amount, total_ht, total_vat, total_ttc,
    valid_until, notes, payment_terms, created_at, updated_at
  ) FROM STDIN WITH CSV"

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (
    SELECT id, company_id, invoice_number, quote_id, person_id, status, title, description,
           subtotal_ht, discount_percent, discount_amount, total_ht, total_vat, total_ttc,
           COALESCE(amount_paid, 0), COALESCE(amount_due, 0),
           issue_date, due_date, payment_terms, payment_method, notes, paid_at,
           COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
    FROM invoices
  ) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_billing -c \
  "COPY invoices (
    id, company_id, invoice_number, quote_id, person_id, status, title, description,
    subtotal_ht, discount_percent, discount_amount, total_ht, total_vat, total_ttc,
    amount_paid, amount_due, issue_date, due_date, payment_terms, payment_method, notes, paid_at,
    created_at, updated_at
  ) FROM STDIN WITH CSV"

echo "Copie billing (quotes + invoices) terminée."
