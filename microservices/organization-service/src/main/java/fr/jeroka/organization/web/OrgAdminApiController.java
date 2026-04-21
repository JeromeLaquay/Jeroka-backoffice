package fr.jeroka.organization.web;

import fr.jeroka.organization.service.OrgAdminStatsService;
import fr.jeroka.organization.service.OrgAdminUserService;
import fr.jeroka.organization.service.OrgCompaniesService;
import fr.jeroka.organization.web.dto.admin.OrgAdminUsersListResponse;
import fr.jeroka.organization.web.dto.admin.OrgCreateAdminUserRequest;
import fr.jeroka.organization.web.dto.admin.OrgUpdateAdminUserRequest;
import fr.jeroka.organization.web.dto.company.OrgCompaniesListResponse;
import fr.jeroka.organization.web.dto.company.OrgCreateCompanyRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class OrgAdminApiController {

    private final OrgAdminStatsService adminStatsService;
    private final OrgCompaniesService companiesService;
    private final OrgAdminUserService adminUserService;

    public OrgAdminApiController(
            OrgAdminStatsService adminStatsService,
            OrgCompaniesService companiesService,
            OrgAdminUserService adminUserService) {
        this.adminStatsService = adminStatsService;
        this.companiesService = companiesService;
        this.adminUserService = adminUserService;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of("success", true, "data", adminStatsService.getStats());
    }

    @GetMapping("/companies")
    public OrgCompaniesListResponse listCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        return companiesService.list(search, status, page, limit, sort_by, sort_order);
    }

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createCompany(@Valid @RequestBody OrgCreateCompanyRequest body) {
        return Map.of("success", true, "data", companiesService.create(body));
    }

    @GetMapping("/companies/{companyId}/users")
    public OrgAdminUsersListResponse listCompanyUsers(
            @PathVariable UUID companyId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        return adminUserService.listForCompany(companyId, search, status, role, page, limit, sort_by, sort_order);
    }

    @GetMapping("/users")
    public OrgAdminUsersListResponse listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        return adminUserService.list(search, status, role, page, limit, sort_by, sort_order);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createUser(@Valid @RequestBody OrgCreateAdminUserRequest body) {
        return Map.of("success", true, "data", adminUserService.create(body));
    }

    @GetMapping("/users/{id}")
    public Map<String, Object> getUser(@PathVariable UUID id) {
        return Map.of("success", true, "data", adminUserService.getById(id));
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable UUID id, @Valid @RequestBody OrgUpdateAdminUserRequest body) {
        return Map.of("success", true, "data", adminUserService.update(id, body));
    }

    @PatchMapping("/users/{id}/toggle-status")
    public Map<String, Object> toggleUserStatus(@PathVariable UUID id) {
        return Map.of("success", true, "data", adminUserService.toggleStatus(id));
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        adminUserService.delete(id);
    }
}
