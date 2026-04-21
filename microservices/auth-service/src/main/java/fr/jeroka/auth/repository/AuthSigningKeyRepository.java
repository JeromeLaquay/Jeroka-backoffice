package fr.jeroka.auth.repository;

import fr.jeroka.auth.entity.AuthSigningKeyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthSigningKeyRepository extends JpaRepository<AuthSigningKeyEntity, String> {

    Optional<AuthSigningKeyEntity> findFirstByStatusOrderByCreatedAtDesc(String status);
}
