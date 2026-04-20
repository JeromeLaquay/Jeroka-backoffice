package fr.jeroka.organization.repository;

import fr.jeroka.organization.entity.OrgCompanySocialCredentialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrgCompanySocialCredentialRepository extends JpaRepository<OrgCompanySocialCredentialEntity, UUID> {

    List<OrgCompanySocialCredentialEntity> findByUserIdAndActiveTrue(UUID userId);

    boolean existsByUserIdAndPlatformAndActiveTrue(UUID userId, String platform);

    Optional<OrgCompanySocialCredentialEntity> findByUserIdAndPlatformAndActiveTrue(UUID userId, String platform);
}
