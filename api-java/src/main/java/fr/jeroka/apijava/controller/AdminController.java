package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.admin.AdminCompaniesListResponse;
import fr.jeroka.apijava.dto.admin.AdminStatsResponse;
import fr.jeroka.apijava.dto.admin.AdminUsersListResponse;
import fr.jeroka.apijava.dto.admin.CreateAdminUserRequest;
import fr.jeroka.apijava.dto.admin.CreateCompanyRequest;
import fr.jeroka.apijava.dto.admin.UpdateAdminUserRequest;
import fr.jeroka.apijava.service.AdminCompanyService;
import fr.jeroka.apijava.service.AdminStatsService;
import fr.jeroka.apijava.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Endpoints admin (tableau de bord, stats, entreprises). Réservé aux utilisateurs authentifiés.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminStatsService adminStatsService;
    private final AdminCompanyService adminCompanyService;
    private final AdminUserService adminUserService;

    public AdminController(AdminStatsService adminStatsService, AdminCompanyService adminCompanyService, AdminUserService adminUserService) {
        this.adminStatsService = adminStatsService;
        this.adminCompanyService = adminCompanyService;
        this.adminUserService = adminUserService;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@AuthenticationPrincipal Object principal) {
        AdminStatsResponse data = adminStatsService.getStats();
        return Map.of("success", true, "data", data);
    }

    @GetMapping("/companies")
    public AdminCompaniesListResponse listCompanies(
            @AuthenticationPrincipal Object principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        var result = adminCompanyService.list(search, status, page, limit, sort_by, sort_order);
        var pagination = new AdminCompaniesListResponse.Pagination(
                result.page(),
                result.limit(),
                result.total(),
                result.totalPages()
        );
        return new AdminCompaniesListResponse(true, result.data(), pagination);
    }

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createCompany(
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody CreateCompanyRequest request) {
        var data = adminCompanyService.create(request);
        return Map.of("success", true, "data", data);
    }

    @GetMapping("/users")
    public AdminUsersListResponse listUsers(
            @AuthenticationPrincipal Object principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        var result = adminUserService.list(search, status, role, page, limit, sort_by, sort_order);
        var pagination = new AdminUsersListResponse.Pagination(
                result.page(),
                result.limit(),
                result.total(),
                result.totalPages()
        );
        return new AdminUsersListResponse(true, result.data(), pagination);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createUser(
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody CreateAdminUserRequest request) {
        var data = adminUserService.create(request);
        return Map.of("success", true, "data", data);
    }

    @GetMapping("/users/{id}")
    public Map<String, Object> getUser(
            @AuthenticationPrincipal Object principal,
            @PathVariable UUID id) {
        var data = adminUserService.getById(id);
        return Map.of("success", true, "data", data);
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(
            @AuthenticationPrincipal Object principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAdminUserRequest request) {
        var data = adminUserService.update(id, request);
        return Map.of("success", true, "data", data);
    }

    @PatchMapping("/users/{id}/toggle-status")
    public Map<String, Object> toggleUserStatus(
            @AuthenticationPrincipal Object principal,
            @PathVariable UUID id) {
        var data = adminUserService.toggleStatus(id);
        return Map.of("success", true, "data", data);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @AuthenticationPrincipal Object principal,
            @PathVariable UUID id) {
        adminUserService.delete(id);
    }
}
