package fr.jeroka.auth.repository;

import fr.jeroka.auth.entity.AuthUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthUserRepository extends JpaRepository<AuthUserEntity, UUID> {

    Optional<AuthUserEntity> findFirstByEmailIgnoreCase(String email);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);
}
