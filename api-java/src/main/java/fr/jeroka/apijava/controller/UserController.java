package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.user.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.UserMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserMappingService userMappingService;

    public UserController(UserMappingService userMappingService) {
        this.userMappingService = userMappingService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PageDto<UserResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var companyId = requireCompanyId(principal.companyId());
        return userMappingService.listByCompany(companyId, page, limit);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public UserStatsResponse stats(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return userMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return userMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userMappingService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return userMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse toggleStatus(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return userMappingService.toggleStatus(id, requireCompanyId(principal.companyId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        userMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
