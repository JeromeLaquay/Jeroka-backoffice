package fr.jeroka.crm.repository;

import fr.jeroka.crm.entity.CrmMessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CrmMessageRepository extends JpaRepository<CrmMessageEntity, UUID> {

    Page<CrmMessageEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<CrmMessageEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);
}
