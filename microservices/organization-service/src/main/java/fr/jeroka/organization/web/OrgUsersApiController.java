package fr.jeroka.organization.web;

import fr.jeroka.organization.security.OrgJwtClaims;
import fr.jeroka.organization.service.OrgUserService;
import fr.jeroka.organization.web.dto.common.PageDto;
import fr.jeroka.organization.web.dto.user.OrgCreateUserRequest;
import fr.jeroka.organization.web.dto.user.OrgUpdateUserRequest;
import fr.jeroka.organization.web.dto.user.OrgUserResponse;
import fr.jeroka.organization.web.dto.user.OrgUserStatsResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/v1/users")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class OrgUsersApiController {

    private final OrgUserService orgUserService;

    public OrgUsersApiController(OrgUserService orgUserService) {
        this.orgUserService = orgUserService;
    }

    @GetMapping("/stats")
    public OrgUserStatsResponse stats(@AuthenticationPrincipal Jwt jwt) {
        return orgUserService.stats(OrgJwtClaims.requireCompanyId(jwt));
    }

    @GetMapping
    public PageDto<OrgUserResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return orgUserService.listByCompany(OrgJwtClaims.requireCompanyId(jwt), page, limit);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrgUserResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody OrgCreateUserRequest body) {
        return orgUserService.create(OrgJwtClaims.requireCompanyId(jwt), body);
    }

    @GetMapping("/{id}")
    public OrgUserResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return orgUserService.getById(id, OrgJwtClaims.requireCompanyId(jwt));
    }

    @PutMapping("/{id}")
    public OrgUserResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody OrgUpdateUserRequest body) {
        return orgUserService.update(id, OrgJwtClaims.requireCompanyId(jwt), body);
    }

    @PutMapping("/{id}/status")
    public OrgUserResponse toggleStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return orgUserService.toggleStatus(id, OrgJwtClaims.requireCompanyId(jwt));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        orgUserService.delete(id, OrgJwtClaims.requireCompanyId(jwt));
    }
}
