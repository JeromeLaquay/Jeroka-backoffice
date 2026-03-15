package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.person.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.PersonMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/persons")
public class PersonController {

    private final PersonMappingService personMappingService;

    public PersonController(PersonMappingService personMappingService) {
        this.personMappingService = personMappingService;
    }

    @GetMapping
    public PageDto<PersonResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var companyId = requireCompanyId(principal.companyId());
        return personMappingService.listByCompany(companyId, page, limit);
    }

    @GetMapping("/stats")
    public PersonStatsResponse stats(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return personMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/{id}")
    public PersonResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return personMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreatePersonRequest request) {
        return personMappingService.create(requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}")
    public PersonResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePersonRequest request) {
        return personMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        personMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
