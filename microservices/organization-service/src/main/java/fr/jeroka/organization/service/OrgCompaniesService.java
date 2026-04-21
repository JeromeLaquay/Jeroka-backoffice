package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgCompanyRepository;
import fr.jeroka.organization.repository.OrgUserRepository;
import fr.jeroka.organization.web.dto.company.OrgAdminCompanyResponse;
import fr.jeroka.organization.web.dto.company.OrgCompaniesListResponse;
import fr.jeroka.organization.web.dto.company.OrgCreateCompanyRequest;
import fr.jeroka.organization.web.dto.company.OrgUpdateCompanyRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class OrgCompaniesService {

    private static final Map<String, String> SORT_FIELDS =
            Map.of("name", "name", "subscription_plan", "subscriptionPlan", "created_at", "createdAt");

    private final OrgCompanyRepository companies;
    private final OrgUserRepository users;

    public OrgCompaniesService(OrgCompanyRepository companies, OrgUserRepository users) {
        this.companies = companies;
        this.users = users;
    }

    public OrgCompaniesListResponse list(String search, String status, int page, int limit, String sortBy, String sortOrder) {
        var pageable = pageRequest(page, limit, sortBy, sortOrder);
        var pageData = companies.findByFilters(normalizeQuery(search), normalizeStatus(status), pageable);
        var filtered = pageData.getContent().stream().map(this::toResponse).toList();
        var pagination = new OrgCompaniesListResponse.Pagination(page, limit, pageData.getTotalElements(), pageData.getTotalPages());
        return new OrgCompaniesListResponse(true, filtered, pagination);
    }

    @Transactional
    public OrgAdminCompanyResponse create(OrgCreateCompanyRequest req) {
        var company = new OrgCompanyEntity();
        company.setName(requiredTrim(req.name(), "Nom obligatoire"));
        company.setLegalName(requiredTrim(req.name(), "Nom obligatoire"));
        company.setEmail(requiredEmail(req.email()));
        company.setPhone(trim(req.phone()));
        company.setAddressLine1(trim(req.address_line1()));
        company.setAddressLine2(trim(req.address_line2()));
        company.setCity(trim(req.city()));
        company.setPostalCode(trim(req.postal_code()));
        company.setCountry(trim(req.country()));
        company.setVatNumber(vatNumberToString(req.vat_number()));
        company.setSiret(trim(req.siret()));
        company.setSubscriptionPlan(trim(req.subscription_plan()));
        company.setStatus("active");
        return toResponse(companies.save(company));
    }

    public OrgAdminCompanyResponse getById(UUID id) {
        return toResponse(requireById(id));
    }

    @Transactional
    public OrgAdminCompanyResponse update(UUID id, OrgUpdateCompanyRequest req) {
        var company = requireById(id);
        applyUpdate(company, req);
        return toResponse(companies.save(company));
    }

    @Transactional
    public OrgAdminCompanyResponse toggleStatus(UUID id) {
        var company = requireById(id);
        company.setStatus(isActive(company) ? "inactive" : "active");
        return toResponse(companies.save(company));
    }

    @Transactional
    public void delete(UUID id) {
        companies.delete(requireById(id));
    }

    private OrgCompanyEntity requireById(UUID id) {
        return companies.findById(id).orElseThrow(() -> new OrgApiException("Entreprise introuvable", HttpStatus.NOT_FOUND));
    }

    private org.springframework.data.domain.PageRequest pageRequest(int page, int limit, String sortBy, String sortOrder) {
        String sortField = SORT_FIELDS.getOrDefault(sortBy, "createdAt");
        var direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        int p = Math.max(0, page - 1);
        int l = Math.min(50, Math.max(1, limit));
        return PageRequest.of(p, l, Sort.by(direction, sortField));
    }

    private void applyUpdate(OrgCompanyEntity c, OrgUpdateCompanyRequest req) {
        if (req.name() != null) c.setName(trim(req.name()));
        if (req.email() != null) c.setEmail(requiredEmail(req.email()));
        if (req.phone() != null) c.setPhone(trim(req.phone()));
        if (req.address_line1() != null) c.setAddressLine1(trim(req.address_line1()));
        if (req.address_line2() != null) c.setAddressLine2(trim(req.address_line2()));
        if (req.city() != null) c.setCity(trim(req.city()));
        if (req.postal_code() != null) c.setPostalCode(trim(req.postal_code()));
        if (req.country() != null) c.setCountry(trim(req.country()));
        if (req.vat_number() != null) c.setVatNumber(vatNumberToString(req.vat_number()));
        if (req.siret() != null) c.setSiret(trim(req.siret()));
        if (req.subscription_plan() != null) c.setSubscriptionPlan(trim(req.subscription_plan()));
        if (req.is_active() != null) c.setStatus(req.is_active() ? "active" : "inactive");
    }

    private OrgAdminCompanyResponse toResponse(OrgCompanyEntity c) {
        return new OrgAdminCompanyResponse(
                c.getId().toString(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getAddressLine1(),
                c.getAddressLine2(),
                c.getCity(),
                c.getPostalCode(),
                c.getCountry(),
                c.getSiret(),
                c.getVatNumber(),
                isActive(c),
                c.getSubscriptionPlan(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null,
                c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null,
                users.countByCompanyId(c.getId()));
    }

    private static boolean isActive(OrgCompanyEntity c) {
        return c.getStatus() == null || !"inactive".equalsIgnoreCase(c.getStatus());
    }

    private static String requiredTrim(String value, String message) {
        String normalized = trim(value);
        if (normalized == null) throw new OrgApiException(message, HttpStatus.BAD_REQUEST);
        return normalized;
    }

    private static String requiredEmail(String value) {
        String normalized = trim(value);
        if (normalized == null || !normalized.contains("@")) {
            throw new OrgApiException("Email obligatoire", HttpStatus.BAD_REQUEST);
        }
        return normalized.toLowerCase();
    }

    private static String trim(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static String normalizeQuery(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return null;
        return "inactive".equalsIgnoreCase(status.trim()) ? "inactive" : "active";
    }

    private static String vatNumberToString(Object value) {
        if (value == null) return null;
        if (value instanceof String str && str.isBlank()) return null;
        return String.valueOf(value).trim();
    }
}
