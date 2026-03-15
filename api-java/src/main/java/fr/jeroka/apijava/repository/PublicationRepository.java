package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, UUID> {

    Page<Publication> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<Publication> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndSlug(UUID companyId, String slug);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);
}
