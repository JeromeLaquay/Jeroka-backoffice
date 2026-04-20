# Scripts SQL microservices (optionnel)

Ce dossier contient des scripts SQL pour:

- Initialiser les bases et les tables (`init/`)
- Migrer les donnees depuis `jeroka_dashboard` (`migrate/`)
- Injecter un jeu de donnees de demo (`seed/`)

## Important

- Le mode recommande en local reste `docker compose` + Flyway (migrations auto au boot des services).
- Avec `microservices/docker-compose.yml`, le service **`sql-seed`** attend les tables Flyway puis exécute automatiquement `seed/10-seed-dev-data.sql` (idempotent). La **gateway** ne démarre qu’après la fin réussie du seed.
- Ces scripts du dossier `sql/` restent utiles si tu veux rejouer ou piloter manuellement les étapes (hors compose).

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

4. Seed dev/demo (optionnel ; automatique via `sql-seed` dans le compose)
```bash
psql -U postgres -d postgres -f microservices/sql/seed/10-seed-dev-data.sql
```

Rejouer uniquement le seed sans tout reconstruire :

```bash
docker compose -f microservices/docker-compose.yml run --rm sql-seed
```

## Notes

- Le script de migration utilise `dblink` avec la connexion par defaut:
  - `dbname=jeroka_dashboard`
- Si ton contexte est different, adapte la variable `dblink_conn` en tete du script `migrate/10-copy-from-jeroka-dashboard.sql`.
