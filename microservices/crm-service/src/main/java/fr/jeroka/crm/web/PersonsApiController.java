package fr.jeroka.crm.web;

import fr.jeroka.crm.security.CrmJwtCompanyId;
import fr.jeroka.crm.service.CrmPersonService;
import fr.jeroka.crm.web.dto.CreatePersonRequestDto;
import fr.jeroka.crm.web.dto.PageDto;
import fr.jeroka.crm.web.dto.PersonResponseDto;
import fr.jeroka.crm.web.dto.PersonStatsResponseDto;
import fr.jeroka.crm.web.dto.UpdatePersonRequestDto;
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
@RequestMapping("/api/v1/persons")
public class PersonsApiController {

    private final CrmPersonService crmPersonService;

    public PersonsApiController(CrmPersonService crmPersonService) {
        this.crmPersonService = crmPersonService;
    }

    @GetMapping
    public PageDto<PersonResponseDto> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return crmPersonService.list(CrmJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/stats")
    public PersonStatsResponseDto stats(@AuthenticationPrincipal Jwt jwt) {
        return crmPersonService.stats(CrmJwtCompanyId.require(jwt));
    }

    @GetMapping("/{id}")
    public PersonResponseDto getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return crmPersonService.getById(id, CrmJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonResponseDto create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreatePersonRequestDto body) {
        return crmPersonService.create(CrmJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public PersonResponseDto update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonRequestDto body) {
        return crmPersonService.update(id, CrmJwtCompanyId.require(jwt), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        crmPersonService.delete(id, CrmJwtCompanyId.require(jwt));
    }
}
