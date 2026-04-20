package fr.jeroka.scheduling.repository;

import fr.jeroka.scheduling.entity.SchedulingAppointmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SchedulingAppointmentRepository extends JpaRepository<SchedulingAppointmentEntity, UUID> {

    Page<SchedulingAppointmentEntity> findByUserIdOrderByStartTimeDesc(UUID userId, Pageable pageable);

    Optional<SchedulingAppointmentEntity> findByIdAndUserId(UUID id, UUID userId);
}
