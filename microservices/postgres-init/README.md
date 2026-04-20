# Init Postgres multi-bases

Le script `01-create-databases.sh` crée les bases `jeroka_*` (hors `jeroka_dashboard`, créée par `POSTGRES_DB`).

Sous Windows : le script doit être en **fins de ligne LF** (pas CRLF), sinon l’init échoue et le conteneur reste *unhealthy*. Le dépôt utilise `.gitattributes` (`*.sh` → `eol=lf`) pour éviter la régression.

Sous Linux/macOS, si Docker ne l’exécute pas : `chmod +x microservices/postgres-init/01-create-databases.sh`.
