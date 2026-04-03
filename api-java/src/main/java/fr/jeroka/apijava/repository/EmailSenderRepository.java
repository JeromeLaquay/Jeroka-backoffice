package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.EmailSender;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailSenderRepository extends JpaRepository<EmailSender, UUID> {
    List<EmailSender> findAllByUserIdOrderByUpdatedAtDesc(UUID userId);
    Optional<EmailSender> findByIdAndUserId(UUID id, UUID userId);
    Optional<EmailSender> findByUserIdAndEmail(UUID userId, String email);
}

