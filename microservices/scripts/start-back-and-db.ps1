param(
  [switch]$Fresh,
  [switch]$NoBuild
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $root

$composeFile = "microservices/docker-compose.yml"
$networkName = "jeroka-dev-network"

Write-Host "Verification du reseau Docker '$networkName'..."
docker network inspect $networkName *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creation du reseau '$networkName'..."
  docker network create $networkName | Out-Null
}

if ($Fresh) {
  Write-Host "Reset complet (down -v)..."
  docker compose -f $composeFile down -v
}

if ($NoBuild) {
  Write-Host "Demarrage back + bdd sans rebuild..."
  docker compose -f $composeFile up -d
} else {
  Write-Host "Demarrage back + bdd avec rebuild..."
  docker compose -f $composeFile up -d --build
}

Write-Host ""
Write-Host "Etat des services:"
docker compose -f $composeFile ps
Write-Host ""
Write-Host "OK. Gateway: http://localhost:3000/api/v1"
