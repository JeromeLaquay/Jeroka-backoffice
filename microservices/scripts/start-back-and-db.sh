#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="microservices/docker-compose.yml"
NETWORK_NAME="jeroka-dev-network"
FRESH=0
NO_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --fresh) FRESH=1 ;;
    --no-build) NO_BUILD=1 ;;
    *)
      echo "Argument inconnu: $arg"
      echo "Usage: bash microservices/scripts/start-back-and-db.sh [--fresh] [--no-build]"
      exit 1
      ;;
  esac
done

echo "Verification du reseau Docker '$NETWORK_NAME'..."
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  echo "Creation du reseau '$NETWORK_NAME'..."
  docker network create "$NETWORK_NAME" >/dev/null
fi

if [ "$FRESH" -eq 1 ]; then
  echo "Reset complet (down -v)..."
  docker compose -f "$COMPOSE_FILE" down -v
fi

if [ "$NO_BUILD" -eq 1 ]; then
  echo "Demarrage back + bdd sans rebuild..."
  docker compose -f "$COMPOSE_FILE" up -d
else
  echo "Demarrage back + bdd avec rebuild..."
  docker compose -f "$COMPOSE_FILE" up -d --build
fi

echo
echo "Etat des services:"
docker compose -f "$COMPOSE_FILE" ps
echo
echo "OK. Gateway: http://localhost:3000/api/v1"
