package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.company.UpdateCompanyRequest;
import fr.jeroka.apijava.entity.Company;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company getById(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ApiException("Entreprise introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Company update(UUID id, UpdateCompanyRequest req) {
        Company c = getById(id);
        applyRequest(c, req);
        return companyRepository.save(c);
    }

    private static void applyRequest(Company c, UpdateCompanyRequest req) {
        if (req.name() != null) c.setName(req.name().trim());
        if (req.legalName() != null) c.setLegalName(req.legalName().trim());
        if (req.siret() != null) c.setSiret(req.siret().trim());
        if (req.vatNumber() != null) c.setVatNumber(req.vatNumber().trim());
        if (req.addressLine1() != null) c.setAddressLine1(req.addressLine1().trim());
        if (req.addressLine2() != null) c.setAddressLine2(req.addressLine2().trim());
        if (req.city() != null) c.setCity(req.city().trim());
        if (req.postalCode() != null) c.setPostalCode(req.postalCode().trim());
        if (req.country() != null) c.setCountry(req.country().trim());
        if (req.phone() != null) c.setPhone(req.phone().trim());
        if (req.email() != null) c.setEmail(req.email().trim().toLowerCase());
        if (req.website() != null) c.setWebsite(req.website().trim());
        if (req.description() != null) c.setDescription(req.description().trim());
        if (req.industry() != null) c.setIndustry(req.industry().trim());
    }
}
