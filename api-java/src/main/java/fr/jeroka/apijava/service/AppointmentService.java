package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Appointment;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.AppointmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Page<Appointment> findByUserId(UUID userId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return appointmentRepository.findByUserIdOrderByStartTimeDesc(userId, p);
    }

    public Appointment getByIdAndUserId(UUID id, UUID userId) {
        return appointmentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException("Rendez-vous introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Appointment create(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment update(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        appointmentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException("Rendez-vous introuvable", HttpStatus.NOT_FOUND));
        appointmentRepository.deleteById(id);
    }

    public long countByUserId(UUID userId) {
        return appointmentRepository.countByUserId(userId);
    }

    public long countByUserIdAndStatus(UUID userId, String status) {
        return appointmentRepository.countByUserIdAndStatus(userId, status);
    }
}
