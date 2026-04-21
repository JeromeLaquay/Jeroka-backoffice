#!/usr/bin/env bash
# Copie publications (colonnes alignées sur content-service) depuis jeroka_dashboard vers jeroka_content.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/microservices/docker-compose.yml")
PSQL_BASE=("${COMPOSE[@]}" exec -T postgres psql -U postgres -v ON_ERROR_STOP=on)

if [ "${REPLACE_CONTENT_PUBLICATIONS:-0}" = "1" ]; then
  echo "REPLACE_CONTENT_PUBLICATIONS=1 : TRUNCATE jeroka_content.publications"
  "${PSQL_BASE[@]}" -d jeroka_content -c "TRUNCATE publications"
fi

"${PSQL_BASE[@]}" -d jeroka_dashboard -c \
  "COPY (
    SELECT id, company_id, title, content, excerpt, featured_image, type, status, category, slug,
           COALESCE(view_count, 0), COALESCE(like_count, 0), COALESCE(share_count, 0),
           scheduled_at, published_at, seo_title, seo_description,
           COALESCE(created_at, now()), COALESCE(updated_at, created_at, now())
    FROM publications
  ) TO STDOUT WITH CSV" \
  | "${PSQL_BASE[@]}" -d jeroka_content -c \
  "COPY publications (
    id, company_id, title, content, excerpt, featured_image, type, status, category, slug,
    view_count, like_count, share_count, scheduled_at, published_at, seo_title, seo_description,
    created_at, updated_at
  ) FROM STDIN WITH CSV"

echo "Copie publications terminée."
