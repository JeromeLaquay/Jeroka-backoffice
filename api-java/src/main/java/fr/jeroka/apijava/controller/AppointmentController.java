package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.appointment.*;
import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.AppointmentMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentMappingService appointmentMappingService;

    public AppointmentController(AppointmentMappingService appointmentMappingService) {
        this.appointmentMappingService = appointmentMappingService;
    }

    @GetMapping
    public PageDto<AppointmentResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var userId = requireUserId(principal.id());
        return appointmentMappingService.listByUserId(userId, page, limit);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return appointmentMappingService.getById(id, requireUserId(principal.id()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateAppointmentRequest request) {
        return appointmentMappingService.create(requireUserId(principal.id()), request);
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        return appointmentMappingService.update(id, requireUserId(principal.id()), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        appointmentMappingService.delete(id, requireUserId(principal.id()));
    }

    private static UUID requireUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ApiException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(userId);
    }
}
