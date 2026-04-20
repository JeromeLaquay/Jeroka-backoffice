package fr.jeroka.content.repository;

import fr.jeroka.content.entity.ContentPublicationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContentPublicationRepository extends JpaRepository<ContentPublicationEntity, UUID> {

    Page<ContentPublicationEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<ContentPublicationEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndSlug(UUID companyId, String slug);

    boolean existsByCompanyIdAndSlugAndIdNot(UUID companyId, String slug, UUID id);
}
