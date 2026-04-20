# Schémas d’événements Kafka (versionnement)

Les payloads métier restent JSON ; l’**enveloppe** commune est documentée ici pour compatibilité ascendante.

## Enveloppe v1 (`schemaVersion` = `1.0`)

| Champ | Type | Description |
|--------|------|-------------|
| `schemaVersion` | string | Ex. `1.0` |
| `eventType` | string | Identifiant stable (souvent égal au nom du topic) |
| `correlationId` | string \| null | Corrélation inter-services (ex. id de job sync) |
| `causationId` | string \| null | Réserve (chaînage causal) |
| `emittedAt` | string (ISO-8601) | Horodatage d’émission |
| `data` | object | Payload métier (ex. `EmailSyncRequestedPayload`) |

## Validation CI (basique)

La CI vérifie que tous les fichiers `*.json` de ce dossier sont du JSON valide (parse) et qu'ils respectent un format cohérent (non vide).

Schémas présents :
- `envelope.schema.v1.json`
- `email.*.schema.v1.json`
