package fr.jeroka.organization.repository;

import fr.jeroka.organization.entity.OrgUserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface OrgUserRepository extends JpaRepository<OrgUserEntity, UUID> {

    Page<OrgUserEntity> findByCompanyId(UUID companyId, Pageable pageable);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndActiveTrue(UUID companyId);

    long countByCompanyIdAndRole(UUID companyId, String role);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);

    @Query(
            "SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM OrgUserEntity u WHERE "
                    + "u.companyId = :companyId AND lower(u.email) = lower(:email) AND u.id <> :excludeId")
    boolean existsOtherWithEmail(
            @Param("companyId") UUID companyId,
            @Param("email") String email,
            @Param("excludeId") UUID excludeId);

    long countByActiveTrue();

    long countByCreatedAtAfter(Instant after);

    @Query(
            "SELECT u FROM OrgUserEntity u WHERE (:search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))"
                    + " OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))"
                    + " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))"
                    + " AND (:active IS NULL OR u.active = :active)"
                    + " AND (:role IS NULL OR u.role = :role)")
    Page<OrgUserEntity> findAdminUsers(
            @Param("search") String search,
            @Param("active") Boolean active,
            @Param("role") String role,
            Pageable pageable);

    @Query(
            "SELECT u FROM OrgUserEntity u WHERE u.companyId = :companyId AND ("
                    + ":search IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))"
                    + " OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))"
                    + " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))"
                    + " AND (:active IS NULL OR u.active = :active)"
                    + " AND (:role IS NULL OR u.role = :role)")
    Page<OrgUserEntity> findAdminUsersByCompany(
            @Param("companyId") UUID companyId,
            @Param("search") String search,
            @Param("active") Boolean active,
            @Param("role") String role,
            Pageable pageable);
}
