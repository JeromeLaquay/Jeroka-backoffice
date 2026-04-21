package fr.jeroka.organization.repository;

import fr.jeroka.organization.entity.OrgOauthGoogleStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface OrgOauthGoogleStateRepository extends JpaRepository<OrgOauthGoogleStateEntity, String> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM OrgOauthGoogleStateEntity o WHERE o.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") Instant cutoff);
}
