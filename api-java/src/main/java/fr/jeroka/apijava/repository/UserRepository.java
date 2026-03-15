package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u WHERE (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))"
            + " OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))"
            + " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))"
            + " AND (:active IS NULL OR u.isActive = :active)"
            + " AND (:role IS NULL OR u.role = :role)")
    Page<User> findAdminUsers(@Param("search") String search, @Param("active") Boolean active,
                              @Param("role") String role, Pageable pageable);

    Optional<User> findByCompanyIdAndEmail(UUID companyId, String email);

    Optional<User> findFirstByEmailIgnoreCase(String email);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    Page<User> findByCompanyId(UUID companyId, Pageable pageable);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndIsActiveTrue(UUID companyId);

    long countByCompanyIdAndRole(UUID companyId, String role);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);

    long countByCreatedAtAfter(Instant after);

    long countByIsActiveTrue();
}
