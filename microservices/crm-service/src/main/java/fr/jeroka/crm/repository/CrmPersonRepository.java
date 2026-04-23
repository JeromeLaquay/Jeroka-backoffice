package fr.jeroka.crm.repository;

import fr.jeroka.crm.entity.CrmPersonEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CrmPersonRepository extends JpaRepository<CrmPersonEntity, UUID> {

    Page<CrmPersonEntity> findByCompanyId(UUID companyId, Pageable pageable);

    Page<CrmPersonEntity> findByCompanyIdAndType(UUID companyId, String type, Pageable pageable);

    @Query(
            """
            SELECT p FROM CrmPersonEntity p
            WHERE p.companyId = :companyId
              AND (:personType IS NULL OR LOWER(p.type) = LOWER(:personType))
              AND (:typeClient IS NULL OR LOWER(p.typeClient) = LOWER(:typeClient))
              AND (:status IS NULL OR LOWER(p.status) = LOWER(:status))
              AND (:search IS NULL
                   OR LOWER(COALESCE(p.firstName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(COALESCE(p.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(COALESCE(p.companyName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<CrmPersonEntity> searchFiltered(
            @Param("companyId") UUID companyId,
            @Param("personType") String personType,
            @Param("typeClient") String typeClient,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    @Query(
            "SELECT COUNT(p) FROM CrmPersonEntity p WHERE p.companyId = :cid "
                    + "AND (:pt IS NULL OR LOWER(p.type) = LOWER(:pt))")
    long countFilteredTotal(@Param("cid") UUID companyId, @Param("pt") String personType);

    @Query(
            "SELECT COUNT(p) FROM CrmPersonEntity p WHERE p.companyId = :cid "
                    + "AND (:pt IS NULL OR LOWER(p.type) = LOWER(:pt)) AND LOWER(p.status) = LOWER(:st)")
    long countFilteredStatus(@Param("cid") UUID companyId, @Param("pt") String personType, @Param("st") String status);

    @Query(
            "SELECT COUNT(p) FROM CrmPersonEntity p WHERE p.companyId = :cid "
                    + "AND (:pt IS NULL OR LOWER(p.type) = LOWER(:pt)) AND p.createdAt >= :after")
    long countFilteredCreatedAfter(
            @Param("cid") UUID companyId, @Param("pt") String personType, @Param("after") Instant after);

    @Query(
            "SELECT COUNT(p) FROM CrmPersonEntity p WHERE p.companyId = :cid "
                    + "AND (:pt IS NULL OR LOWER(p.type) = LOWER(:pt)) AND LOWER(p.typeClient) = 'company'")
    long countFilteredCompanies(@Param("cid") UUID companyId, @Param("pt") String personType);

    Optional<CrmPersonEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);
}
