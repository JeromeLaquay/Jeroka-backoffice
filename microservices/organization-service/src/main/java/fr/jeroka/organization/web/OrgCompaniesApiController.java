package fr.jeroka.organization.web;

import fr.jeroka.organization.service.OrgCompaniesService;
import fr.jeroka.organization.web.dto.company.OrgCompaniesListResponse;
import fr.jeroka.organization.web.dto.company.OrgCreateCompanyRequest;
import fr.jeroka.organization.web.dto.company.OrgUpdateCompanyRequest;
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
@RequestMapping("/api/v1/companies")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class OrgCompaniesApiController {

    private final OrgCompaniesService companiesService;

    public OrgCompaniesApiController(OrgCompaniesService companiesService) {
        this.companiesService = companiesService;
    }

    @GetMapping
    public OrgCompaniesListResponse list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "created_at") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_order) {
        return companiesService.list(search, status, page, limit, sort_by, sort_order);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody OrgCreateCompanyRequest body) {
        return Map.of("success", true, "data", companiesService.create(body));
    }

    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable UUID id) {
        return Map.of("success", true, "data", companiesService.getById(id));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable UUID id, @Valid @RequestBody OrgUpdateCompanyRequest body) {
        return Map.of("success", true, "data", companiesService.update(id, body));
    }

    @PatchMapping("/{id}/toggle-status")
    public Map<String, Object> toggleStatus(@PathVariable UUID id) {
        return Map.of("success", true, "data", companiesService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        companiesService.delete(id);
    }
}
