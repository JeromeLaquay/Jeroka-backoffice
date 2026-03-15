package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {

    Page<Person> findByCompanyId(UUID companyId, Pageable pageable);

    Optional<Person> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndEmail(UUID companyId, String email);

    long countByCompanyId(UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);
}
