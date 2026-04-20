#!/bin/bash
set -e

createdb_if_missing() {
  DBNAME="$1"
  EXISTS=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DBNAME}'")
  if [ "$EXISTS" != "1" ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c "CREATE DATABASE \"${DBNAME}\""
  fi
}

for DBNAME in jeroka_auth jeroka_organization jeroka_crm jeroka_catalog jeroka_billing jeroka_scheduling jeroka_content jeroka_email jeroka_docs jeroka_audit; do
  createdb_if_missing "$DBNAME"
done
