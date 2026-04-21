package fr.jeroka.catalog.repository;

import fr.jeroka.catalog.entity.CatalogProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CatalogProductRepository extends JpaRepository<CatalogProductEntity, UUID> {

    Page<CatalogProductEntity> findByCompanyId(UUID companyId, Pageable pageable);

    Optional<CatalogProductEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndSku(UUID companyId, String sku);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndIsActiveTrue(UUID companyId);

    @Query(
            "SELECT DISTINCT p.category FROM CatalogProductEntity p WHERE p.companyId = :companyId "
                    + "AND p.category IS NOT NULL AND p.category <> ''")
    List<String> findDistinctCategoriesByCompanyId(@Param("companyId") UUID companyId);
}
