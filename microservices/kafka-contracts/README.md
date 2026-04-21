# kafka-contracts

Module Maven **sans Spring** : enveloppe d’événements, noms de topics par domaine, en-têtes recommandés, payloads email partagés, interface outbox et utilitaires consommateur.

## Build

```bash
mvn -q -DskipTests install -f microservices/kafka-contracts/pom.xml
```

Les autres modules (`email-service`, workers, services domaine) dépendent de `fr.jeroka:kafka-contracts:1.0.0-SNAPSHOT` ; installer ce module avant `mvn package` sur un module consommateur.
