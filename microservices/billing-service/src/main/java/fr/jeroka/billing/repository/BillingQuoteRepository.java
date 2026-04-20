package fr.jeroka.billing.repository;

import fr.jeroka.billing.entity.BillingQuoteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface BillingQuoteRepository extends JpaRepository<BillingQuoteEntity, UUID> {

    Page<BillingQuoteEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<BillingQuoteEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    Optional<BillingQuoteEntity> findFirstByCompanyIdOrderByQuoteNumberDesc(UUID companyId);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);
}
