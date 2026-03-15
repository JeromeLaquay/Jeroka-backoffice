package fr.jeroka.apijava.repository;

import fr.jeroka.apijava.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findByUserIdOrderByStartTimeDesc(UUID userId, Pageable pageable);

    Optional<Appointment> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, String status);

    boolean existsByPersonId(UUID personId);
}
