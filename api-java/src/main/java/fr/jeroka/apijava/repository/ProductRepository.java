package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByCompanyId(UUID companyId, Pageable pageable);

    Optional<Product> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndSku(UUID companyId, String sku);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndIsActiveTrue(UUID companyId);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.companyId = :companyId AND p.category IS NOT NULL AND p.category != ''")
    List<String> findDistinctCategoriesByCompanyId(@Param("companyId") UUID companyId);
}
