package fr.jeroka.contracts.kafka;

/**
 * Persistance outbox (implémentée par chaque service avec sa base).
 */
public interface OutboxStore {

    void enqueue(OutboxRecord record);
}
