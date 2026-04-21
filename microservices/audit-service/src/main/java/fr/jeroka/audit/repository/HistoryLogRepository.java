package fr.jeroka.audit.repository;

import fr.jeroka.audit.entity.HistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HistoryLogRepository extends JpaRepository<HistoryLog, UUID> {

    List<HistoryLog> findTop200ByTopicOrderByCreatedAtDesc(String topic);
}
