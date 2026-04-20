package fr.jeroka.billing.repository;

import fr.jeroka.billing.entity.BillingInvoiceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingInvoiceRepository extends JpaRepository<BillingInvoiceEntity, UUID> {

    Page<BillingInvoiceEntity> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    Optional<BillingInvoiceEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    Optional<BillingInvoiceEntity> findFirstByCompanyIdOrderByInvoiceNumberDesc(UUID companyId);

    @Query("SELECT COALESCE(SUM(i.totalTtc), 0) FROM BillingInvoiceEntity i WHERE i.companyId = :companyId")
    BigDecimal sumTotalTtcByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM BillingInvoiceEntity i WHERE i.companyId = :companyId")
    BigDecimal sumAmountPaidByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM BillingInvoiceEntity i WHERE i.companyId = :companyId")
    BigDecimal sumAmountDueByCompanyId(@Param("companyId") UUID companyId);

    long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after);

    @Query(
            value =
                    """
                    SELECT TO_CHAR(DATE_TRUNC('month', issue_date::timestamp), 'YYYY-MM') AS month,
                           COALESCE(SUM(total_ttc), 0) AS total
                    FROM invoices
                    WHERE company_id = :companyId
                    GROUP BY DATE_TRUNC('month', issue_date::timestamp)
                    ORDER BY DATE_TRUNC('month', issue_date::timestamp) DESC
                    LIMIT 12
                    """,
            nativeQuery = true)
    List<Object[]> findMonthlyRevenueLast12(@Param("companyId") UUID companyId);

    @Query(
            "SELECT i.status, COUNT(i) FROM BillingInvoiceEntity i WHERE i.companyId = :companyId GROUP BY i.status")
    List<Object[]> countInvoicesByStatus(@Param("companyId") UUID companyId);
}
