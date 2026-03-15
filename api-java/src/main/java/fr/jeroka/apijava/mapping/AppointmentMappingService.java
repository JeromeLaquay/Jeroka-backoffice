package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.appointment.*;
import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.entity.Appointment;
import fr.jeroka.apijava.service.AppointmentService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AppointmentMappingService {

    private final AppointmentService appointmentService;

    public AppointmentMappingService(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    public PageDto<AppointmentResponse> listByUserId(UUID userId, int page, int limit) {
        var p = appointmentService.findByUserId(userId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public AppointmentResponse getById(UUID id, UUID userId) {
        return toResponse(appointmentService.getByIdAndUserId(id, userId));
    }

    public AppointmentResponse create(UUID userId, CreateAppointmentRequest request) {
        var appointment = toEntity(userId, request);
        return toResponse(appointmentService.create(appointment));
    }

    public AppointmentResponse update(UUID id, UUID userId, UpdateAppointmentRequest request) {
        var appointment = appointmentService.getByIdAndUserId(id, userId);
        applyUpdate(appointment, request);
        return toResponse(appointmentService.update(appointment));
    }

    public void delete(UUID id, UUID userId) {
        appointmentService.delete(id, userId);
    }

    public AppointmentResponse toResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId().toString(),
                a.getUserId(),
                a.getPersonId(),
                a.getGoogleEventId(),
                a.getStatus(),
                a.getStartTime(),
                a.getEndTime(),
                a.getNotes(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    private Appointment toEntity(UUID userId, CreateAppointmentRequest req) {
        var a = new Appointment();
        a.setUserId(userId);
        a.setPersonId(req.personId());
        a.setGoogleEventId(trim(req.googleEventId()));
        a.setStartTime(req.startTime());
        a.setEndTime(req.endTime());
        a.setStatus(req.status() != null ? req.status() : "pending");
        a.setNotes(trim(req.notes()));
        return a;
    }

    private void applyUpdate(Appointment a, UpdateAppointmentRequest req) {
        if (req.startTime() != null) a.setStartTime(req.startTime());
        if (req.endTime() != null) a.setEndTime(req.endTime());
        if (req.status() != null) a.setStatus(req.status());
        if (req.notes() != null) a.setNotes(req.notes().trim());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
