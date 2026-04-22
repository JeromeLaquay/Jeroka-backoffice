package fr.jeroka.content.repository;

import fr.jeroka.content.entity.ContentOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentOrderRepository extends JpaRepository<ContentOrderEntity, UUID> {

    List<ContentOrderEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    Optional<ContentOrderEntity> findByIdAndCompanyId(UUID id, UUID companyId);
}
