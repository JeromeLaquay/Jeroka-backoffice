-- Exécuter connecté à la base "postgres" avec un rôle superuser.
-- Exemple :
-- psql -U postgres -d postgres -f microservices/sql/init/00-create-databases.sql

SELECT format('CREATE DATABASE %I', db_name)
FROM (VALUES
  ('jeroka_auth'),
  ('jeroka_organization'),
  ('jeroka_crm'),
  ('jeroka_catalog'),
  ('jeroka_billing'),
  ('jeroka_scheduling'),
  ('jeroka_content'),
  ('jeroka_email'),
  ('jeroka_docs'),
  ('jeroka_audit')
) AS dbs(db_name)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database d WHERE d.datname = dbs.db_name
)
\gexec
