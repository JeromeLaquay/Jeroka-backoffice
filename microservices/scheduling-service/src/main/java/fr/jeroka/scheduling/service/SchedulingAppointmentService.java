package fr.jeroka.scheduling.service;

import fr.jeroka.scheduling.entity.SchedulingAppointmentEntity;
import fr.jeroka.scheduling.exception.SchedulingApiException;
import fr.jeroka.scheduling.repository.SchedulingAppointmentRepository;
import fr.jeroka.scheduling.web.dto.AppointmentResponse;
import fr.jeroka.scheduling.web.dto.CreateAppointmentRequest;
import fr.jeroka.scheduling.web.dto.PageDto;
import fr.jeroka.scheduling.web.dto.UpdateAppointmentRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SchedulingAppointmentService {

    private final SchedulingAppointmentRepository appointments;

    public SchedulingAppointmentService(SchedulingAppointmentRepository appointments) {
        this.appointments = appointments;
    }

    @Transactional(readOnly = true)
    public PageDto<AppointmentResponse> list(UUID userId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = appointments.findByUserIdOrderByStartTimeDesc(userId, p);
        var items = result.getContent().stream().map(SchedulingAppointmentMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id, UUID userId) {
        return SchedulingAppointmentMapper.toResponse(loadOwned(id, userId));
    }

    @Transactional
    public AppointmentResponse create(UUID userId, CreateAppointmentRequest req) {
        var a = SchedulingAppointmentMapper.toNewEntity(userId, req);
        return SchedulingAppointmentMapper.toResponse(appointments.save(a));
    }

    @Transactional
    public AppointmentResponse update(UUID id, UUID userId, UpdateAppointmentRequest req) {
        SchedulingAppointmentEntity a = loadOwned(id, userId);
        SchedulingAppointmentMapper.applyUpdate(a, req);
        return SchedulingAppointmentMapper.toResponse(appointments.save(a));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        loadOwned(id, userId);
        appointments.deleteById(id);
    }

    private SchedulingAppointmentEntity loadOwned(UUID id, UUID userId) {
        return appointments
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new SchedulingApiException("Rendez-vous introuvable", HttpStatus.NOT_FOUND));
    }
}
