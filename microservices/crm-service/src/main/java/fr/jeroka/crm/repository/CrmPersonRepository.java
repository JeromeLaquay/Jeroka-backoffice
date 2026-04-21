package fr.jeroka.crm.repository;

import fr.jeroka.crm.entity.CrmPersonEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CrmPersonRepository extends JpaRepository<CrmPersonEntity, UUID> {

    Page<CrmPersonEntity> findByCompanyId(UUID companyId, Pageable pageable);

    Optional<CrmPersonEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);
}
