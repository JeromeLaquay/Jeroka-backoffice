package fr.jeroka.emailservice.repository;

import fr.jeroka.emailservice.entity.EmailSyncJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailSyncJobRepository extends JpaRepository<EmailSyncJob, UUID> {
    Optional<EmailSyncJob> findByIdAndUserId(UUID id, UUID userId);
}

