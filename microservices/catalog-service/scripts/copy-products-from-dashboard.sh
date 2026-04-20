#!/usr/bin/env bash
# Copie les colonnes produits utiles depuis jeroka_dashboard vers jeroka_catalog (CSV).
# Usage : bash microservices/catalog-service/scripts/copy-products-from-dashboard.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_CATALOG_PRODUCTS:-0}" = "1" ]; then
  echo "REPLACE_CATALOG_PRODUCTS=1 : TRUNCATE jeroka_catalog.products"
  "${PSQL_BASE[@]}" -d jeroka_catalog -c "TRUNCATE products"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (
    SELECT id, company_id, name, description, short_description, sku, category,
           price_ht, vat_number, cost_price, stock_quantity, min_stock_level, unit,
           COALESCE(is_active, true),
           COALESCE(created_at, now()),
           COALESCE(updated_at, created_at, now())
    FROM products
  ) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_catalog -c \
  "COPY products (
    id, company_id, name, description, short_description, sku, category,
    price_ht, vat_number, cost_price, stock_quantity, min_stock_level, unit,
    is_active, created_at, updated_at
  ) FROM STDIN WITH CSV"

echo "Copie products terminée."
