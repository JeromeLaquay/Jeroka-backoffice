package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.company.CompanyResponse;
import fr.jeroka.apijava.dto.company.UpdateCompanyRequest;
import fr.jeroka.apijava.entity.Company;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.security.JwtService;
import fr.jeroka.apijava.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/company")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public CompanyResponse get(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        UUID companyId = requireCompanyId(principal != null ? principal.companyId() : null);
        Company c = companyService.getById(companyId);
        return toResponse(c);
    }

    @PutMapping
    public CompanyResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody UpdateCompanyRequest request) {
        UUID companyId = requireCompanyId(principal != null ? principal.companyId() : null);
        Company c = companyService.update(companyId, request);
        return toResponse(c);
    }

    private static CompanyResponse toResponse(Company c) {
        return new CompanyResponse(
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
                c.getIndustry()
        );
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(companyId.trim());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
