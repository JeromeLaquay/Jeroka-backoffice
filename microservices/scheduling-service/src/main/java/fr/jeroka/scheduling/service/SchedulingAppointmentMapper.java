package fr.jeroka.scheduling.service;

import fr.jeroka.scheduling.entity.SchedulingAppointmentEntity;
import fr.jeroka.scheduling.web.dto.AppointmentResponse;
import fr.jeroka.scheduling.web.dto.CreateAppointmentRequest;
import fr.jeroka.scheduling.web.dto.UpdateAppointmentRequest;

import java.util.UUID;

public final class SchedulingAppointmentMapper {

    private SchedulingAppointmentMapper() {}

    public static AppointmentResponse toResponse(SchedulingAppointmentEntity a) {
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
                a.getUpdatedAt());
    }

    public static SchedulingAppointmentEntity toNewEntity(UUID userId, CreateAppointmentRequest req) {
        var a = new SchedulingAppointmentEntity();
        a.setUserId(userId);
        a.setPersonId(req.personId());
        a.setGoogleEventId(trim(req.googleEventId()));
        a.setStartTime(req.startTime());
        a.setEndTime(req.endTime());
        a.setStatus(req.status() != null ? req.status() : "pending");
        a.setNotes(trim(req.notes()));
        return a;
    }

    public static void applyUpdate(SchedulingAppointmentEntity a, UpdateAppointmentRequest req) {
        if (req.startTime() != null) {
            a.setStartTime(req.startTime());
        }
        if (req.endTime() != null) {
            a.setEndTime(req.endTime());
        }
        if (req.status() != null) {
            a.setStatus(req.status());
        }
        if (req.notes() != null) {
            a.setNotes(req.notes().trim());
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
