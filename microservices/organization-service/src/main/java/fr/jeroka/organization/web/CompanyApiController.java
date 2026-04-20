package fr.jeroka.organization.web;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import fr.jeroka.organization.security.OrgJwtClaims;
import fr.jeroka.organization.service.OrgCompanyService;
import fr.jeroka.organization.web.dto.CompanyResponseDto;
import fr.jeroka.organization.web.dto.UpdateCompanyRequestDto;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Fiche entreprise de l’utilisateur connecté (JWT claim companyId).
 */
@RestController
public class CompanyApiController {

    private final OrgCompanyService orgCompanyService;

    public CompanyApiController(OrgCompanyService orgCompanyService) {
        this.orgCompanyService = orgCompanyService;
    }

    @GetMapping("/api/v1/company")
    public CompanyResponseDto get(@AuthenticationPrincipal Jwt jwt) {
        return toDto(orgCompanyService.getById(OrgJwtClaims.requireCompanyId(jwt)));
    }

    @PutMapping("/api/v1/company")
    public CompanyResponseDto update(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateCompanyRequestDto body) {
        return toDto(orgCompanyService.update(OrgJwtClaims.requireCompanyId(jwt), body));
    }

    private static CompanyResponseDto toDto(OrgCompanyEntity c) {
        return new CompanyResponseDto(
                c.getId().toString(),
                c.getName(),
                c.getLegalName(),
                c.getSiret(),
                c.getVatNumber(),
                c.getAddressLine1(),
                c.getAddressLine2(),
                c.getCity(),
                c.getPostalCode(),
                c.getCountry(),
                c.getPhone(),
                c.getEmail(),
                c.getWebsite(),
                c.getLogoUrl(),
                c.getDescription(),
                c.getIndustry());
    }
}
