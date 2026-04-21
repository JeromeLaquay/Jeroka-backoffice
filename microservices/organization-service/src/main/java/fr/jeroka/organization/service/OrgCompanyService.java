package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgCompanyRepository;
import fr.jeroka.organization.web.dto.UpdateCompanyRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrgCompanyService {

    private final OrgCompanyRepository companies;

    public OrgCompanyService(OrgCompanyRepository companies) {
        this.companies = companies;
    }

    @Transactional(readOnly = true)
    public OrgCompanyEntity getById(UUID id) {
        return companies.findById(id)
                .orElseThrow(() -> new OrgApiException("Entreprise introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public OrgCompanyEntity update(UUID id, UpdateCompanyRequestDto req) {
        OrgCompanyEntity c = getById(id);
        applyUpdate(c, req);
        return companies.save(c);
    }

    private static void applyUpdate(OrgCompanyEntity c, UpdateCompanyRequestDto req) {
        if (req.name() != null) {
            c.setName(req.name().trim());
        }
        if (req.legalName() != null) {
            c.setLegalName(req.legalName().trim());
        }
        if (req.siret() != null) {
            c.setSiret(req.siret().trim());
        }
        if (req.vatNumber() != null) {
            c.setVatNumber(req.vatNumber().trim());
        }
        if (req.addressLine1() != null) {
            c.setAddressLine1(req.addressLine1().trim());
        }
        if (req.addressLine2() != null) {
            c.setAddressLine2(req.addressLine2().trim());
        }
        if (req.city() != null) {
            c.setCity(req.city().trim());
        }
        if (req.postalCode() != null) {
            c.setPostalCode(req.postalCode().trim());
        }
        if (req.country() != null) {
            c.setCountry(req.country().trim());
        }
        if (req.phone() != null) {
            c.setPhone(req.phone().trim());
        }
        if (req.email() != null) {
            c.setEmail(req.email().trim().toLowerCase());
        }
        if (req.website() != null) {
            c.setWebsite(req.website().trim());
        }
        if (req.description() != null) {
            c.setDescription(req.description().trim());
        }
        if (req.industry() != null) {
            c.setIndustry(req.industry().trim());
        }
    }
}
