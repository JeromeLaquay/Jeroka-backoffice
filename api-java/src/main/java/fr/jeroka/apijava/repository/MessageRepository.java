package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<Message> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);

    boolean existsByPersonId(UUID personId);
}
