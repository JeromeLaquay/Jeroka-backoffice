# Scripts SQL microservices (optionnel)

Ce dossier contient des scripts SQL pour:

- Initialiser les bases et les tables (`init/`)
- Migrer les donnees depuis `jeroka_dashboard` (`migrate/`)
- Injecter un jeu de donnees de demo (`seed/`)

## Important

- Le mode recommande en local reste `docker compose` + Flyway (migrations auto au boot des services).
- Ces scripts sont utiles si tu veux controler manuellement les etapes SQL.

## Ordre recommande

1. Creation des bases
```bash
psql -U postgres -d postgres -f microservices/sql/init/00-create-databases.sql
```

2. Creation des tables/index
```bash
psql -U postgres -d postgres -f microservices/sql/init/10-create-tables-all.sql
```

3. Migration des donnees metier depuis `jeroka_dashboard`
```bash
psql -U postgres -d postgres -f microservices/sql/migrate/10-copy-from-jeroka-dashboard.sql
```

4. Seed dev/demo (optionnel)
```bash
psql -U postgres -d postgres -f microservices/sql/seed/10-seed-dev-data.sql
```

## Notes

- Le script de migration utilise `dblink` avec la connexion par defaut:
  - `dbname=jeroka_dashboard`
- Si ton contexte est different, adapte la variable `dblink_conn` en tete du script `migrate/10-copy-from-jeroka-dashboard.sql`.
