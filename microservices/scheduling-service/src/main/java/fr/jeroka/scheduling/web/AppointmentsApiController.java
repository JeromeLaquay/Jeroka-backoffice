package fr.jeroka.scheduling.web;

import fr.jeroka.scheduling.security.SchedulingJwtUserId;
import fr.jeroka.scheduling.service.SchedulingAppointmentService;
import fr.jeroka.scheduling.web.dto.AppointmentResponse;
import fr.jeroka.scheduling.web.dto.CreateAppointmentRequest;
import fr.jeroka.scheduling.web.dto.PageDto;
import fr.jeroka.scheduling.web.dto.UpdateAppointmentRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentsApiController {

    private final SchedulingAppointmentService schedulingAppointmentService;

    public AppointmentsApiController(SchedulingAppointmentService schedulingAppointmentService) {
        this.schedulingAppointmentService = schedulingAppointmentService;
    }

    @GetMapping
    public PageDto<AppointmentResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return schedulingAppointmentService.list(SchedulingJwtUserId.require(jwt), page, limit);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return schedulingAppointmentService.getById(id, SchedulingJwtUserId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateAppointmentRequest body) {
        return schedulingAppointmentService.create(SchedulingJwtUserId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAppointmentRequest body) {
        return schedulingAppointmentService.update(id, SchedulingJwtUserId.require(jwt), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        schedulingAppointmentService.delete(id, SchedulingJwtUserId.require(jwt));
    }
}
