docker compose -f docker-compose.dev.yml down
docker volume rm jeroka-postgres-dev-data
docker compose -f docker-compose.dev.yml up -d --build