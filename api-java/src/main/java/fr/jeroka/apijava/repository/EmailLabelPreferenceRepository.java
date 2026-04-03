package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.EmailLabelPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailLabelPreferenceRepository extends JpaRepository<EmailLabelPreference, UUID> {
    Optional<EmailLabelPreference> findByUserIdAndLabelId(UUID userId, String labelId);
    void deleteByUserIdAndLabelId(UUID userId, String labelId);
}

