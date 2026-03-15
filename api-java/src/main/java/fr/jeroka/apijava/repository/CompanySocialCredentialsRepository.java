package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.CompanySocialCredential;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanySocialCredentialsRepository extends JpaRepository<CompanySocialCredential, UUID> {

    Optional<CompanySocialCredential> findByUserIdAndPlatformAndIsActiveTrue(UUID userId, String platform);

    List<CompanySocialCredential> findByUserIdAndIsActiveTrue(UUID userId);
}
