package fr.jeroka.organization.repository;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface OrgCompanyRepository extends JpaRepository<OrgCompanyEntity, UUID> {

    @Query(
            "SELECT c FROM OrgCompanyEntity c WHERE "
                    + "(:search IS NULL OR lower(c.name) LIKE lower(concat('%', :search, '%')) "
                    + "OR lower(c.email) LIKE lower(concat('%', :search, '%'))) "
                    + "AND (:status IS NULL OR lower(coalesce(c.status, 'active')) = lower(:status))")
    Page<OrgCompanyEntity> findByFilters(
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable);

    long countByCreatedAtAfter(Instant after);

    long countBySubscriptionPlan(String subscriptionPlan);
}
