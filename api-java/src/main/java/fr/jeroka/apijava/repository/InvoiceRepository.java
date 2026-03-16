package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Page<Invoice> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<Invoice> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);

    Optional<Invoice> findFirstByCompanyIdOrderByInvoiceNumberDesc(UUID companyId);

    boolean existsByPersonId(UUID personId);

    @Query("SELECT COALESCE(SUM(i.totalTtc), 0) FROM Invoice i WHERE i.companyId = :companyId")
    BigDecimal sumTotalTtcByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.companyId = :companyId")
    BigDecimal sumAmountPaidByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM Invoice i WHERE i.companyId = :companyId")
    BigDecimal sumAmountDueByCompanyId(@Param("companyId") UUID companyId);

    List<Invoice> findTop5ByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    @Query(value = """
            SELECT TO_CHAR(DATE_TRUNC('month', issue_date::timestamp), 'YYYY-MM') AS month,
                   COALESCE(SUM(total_ttc), 0) AS total
            FROM invoices
            WHERE company_id = :companyId
            GROUP BY DATE_TRUNC('month', issue_date::timestamp)
            ORDER BY DATE_TRUNC('month', issue_date::timestamp) DESC
            LIMIT 12
            """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueLast6Months(@Param("companyId") UUID companyId);

    @Query("SELECT i.status, COUNT(i) FROM Invoice i WHERE i.companyId = :companyId GROUP BY i.status")
    List<Object[]> countByStatusAndCompanyId(@Param("companyId") UUID companyId);
}
