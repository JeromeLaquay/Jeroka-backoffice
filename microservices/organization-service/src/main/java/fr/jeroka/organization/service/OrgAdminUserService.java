package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgCompanyEntity;
import fr.jeroka.organization.entity.OrgUserEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgCompanyRepository;
import fr.jeroka.organization.repository.OrgUserRepository;
import fr.jeroka.organization.web.dto.admin.OrgAdminUserResponse;
import fr.jeroka.organization.web.dto.admin.OrgAdminUsersListResponse;
import fr.jeroka.organization.web.dto.admin.OrgCreateAdminUserRequest;
import fr.jeroka.organization.web.dto.admin.OrgUpdateAdminUserRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrgAdminUserService {

    private static final Map<String, String> SORT_FIELDS =
            Map.of("created_at", "createdAt", "email", "email", "first_name", "firstName", "last_name", "lastName", "role", "role");

    private final OrgUserRepository users;
    private final OrgCompanyRepository companies;
    private final PasswordEncoder passwordEncoder;

    public OrgAdminUserService(OrgUserRepository users, OrgCompanyRepository companies, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.companies = companies;
        this.passwordEncoder = passwordEncoder;
    }

    public OrgAdminUsersListResponse list(
            String search, String status, String role, int page, int limit, String sortBy, String sortOrder) {
        Pageable pageable = pageable(page, limit, sortBy, sortOrder);
        String searchTrim = search != null && !search.isBlank() ? search.trim() : null;
        Boolean active = mapStatus(status);
        String roleFilter = role != null && !role.isBlank() ? role.trim() : null;
        var userPage = users.findAdminUsers(searchTrim, active, roleFilter, pageable);
        var names = companyNames(userPage.getContent().stream().map(OrgUserEntity::getCompanyId).collect(Collectors.toSet()));
        var items = userPage.getContent().stream().map(u -> toResponse(u, names.get(u.getCompanyId()))).toList();
        var pagination = paginationOf(page, limit, userPage);
        return new OrgAdminUsersListResponse(true, items, pagination);
    }

    public OrgAdminUsersListResponse listForCompany(
            UUID companyId,
            String search,
            String status,
            String role,
            int page,
            int limit,
            String sortBy,
            String sortOrder) {
        requireCompany(companyId);
        Pageable pageable = pageable(page, limit, sortBy, sortOrder);
        String searchTrim = search != null && !search.isBlank() ? search.trim() : null;
        Boolean active = mapStatus(status);
        String roleFilter = role != null && !role.isBlank() ? role.trim() : null;
        var userPage = users.findAdminUsersByCompany(companyId, searchTrim, active, roleFilter, pageable);
        String companyName = companies.findById(companyId).map(OrgCompanyEntity::getName).orElse(null);
        var items = userPage.getContent().stream().map(u -> toResponse(u, companyName)).toList();
        var pagination = paginationOf(page, limit, userPage);
        return new OrgAdminUsersListResponse(true, items, pagination);
    }

    @Transactional
    public OrgAdminUserResponse create(OrgCreateAdminUserRequest req) {
        UUID companyId = parseUuid(req.company_id(), "company_id invalide");
        OrgCompanyEntity company = requireCompany(companyId);
        if (users.existsByCompanyIdAndEmail(companyId, req.email().trim().toLowerCase())) {
            throw new OrgApiException("Un utilisateur existe déjà avec cet email dans cette entreprise", HttpStatus.CONFLICT);
        }
        OrgUserEntity u = new OrgUserEntity();
        u.setCompanyId(companyId);
        u.setEmail(req.email().trim().toLowerCase());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setFirstName(req.first_name().trim());
        u.setLastName(req.last_name().trim());
        u.setRole(req.role() != null && !req.role().isBlank() ? req.role().trim() : "user");
        u.setActive(true);
        if (req.telephone() != null && !req.telephone().isBlank()) {
            u.setPhone(req.telephone().trim());
        }
        return toResponse(users.save(u), company.getName());
    }

    public OrgAdminUserResponse getById(UUID id) {
        OrgUserEntity u = requireUser(id);
        String name = companies.findById(u.getCompanyId()).map(OrgCompanyEntity::getName).orElse(null);
        return toResponse(u, name);
    }

    @Transactional
    public OrgAdminUserResponse update(UUID id, OrgUpdateAdminUserRequest req) {
        OrgUserEntity u = requireUser(id);
        if (req.first_name() != null && !req.first_name().isBlank()) {
            u.setFirstName(req.first_name().trim());
        }
        if (req.last_name() != null && !req.last_name().isBlank()) {
            u.setLastName(req.last_name().trim());
        }
        if (req.email() != null && !req.email().isBlank()) {
            u.setEmail(req.email().trim().toLowerCase());
        }
        if (req.role() != null && !req.role().isBlank()) {
            u.setRole(req.role().trim());
        }
        if (req.is_active() != null) {
            u.setActive(req.is_active());
        }
        if (req.telephone() != null && !req.telephone().isBlank()) {
            u.setPhone(req.telephone().trim());
        }
        u = users.save(u);
        String companyName = companies.findById(u.getCompanyId()).map(OrgCompanyEntity::getName).orElse(null);
        return toResponse(u, companyName);
    }

    @Transactional
    public OrgAdminUserResponse toggleStatus(UUID id) {
        OrgUserEntity u = requireUser(id);
        u.setActive(!u.isActive());
        u = users.save(u);
        String companyName = companies.findById(u.getCompanyId()).map(OrgCompanyEntity::getName).orElse(null);
        return toResponse(u, companyName);
    }

    @Transactional
    public void delete(UUID id) {
        users.delete(requireUser(id));
    }

    private OrgUserEntity requireUser(UUID id) {
        return users.findById(id).orElseThrow(() -> new OrgApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    private OrgCompanyEntity requireCompany(UUID id) {
        return companies.findById(id).orElseThrow(() -> new OrgApiException("Entreprise introuvable", HttpStatus.NOT_FOUND));
    }

    private static UUID parseUuid(String raw, String message) {
        try {
            return UUID.fromString(raw.trim());
        } catch (Exception e) {
            throw new OrgApiException(message, HttpStatus.BAD_REQUEST);
        }
    }

    private static Boolean mapStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return "active".equalsIgnoreCase(status.trim());
    }

    private static Pageable pageable(int page, int limit, String sortBy, String sortOrder) {
        String sortField = SORT_FIELDS.getOrDefault(sortBy, "createdAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        int p = Math.max(0, page - 1);
        int l = Math.min(50, Math.max(1, limit));
        return PageRequest.of(p, l, Sort.by(direction, sortField));
    }

    private static OrgAdminUsersListResponse.Pagination paginationOf(int page, int limit, org.springframework.data.domain.Page<?> userPage) {
        int totalPages = (int) Math.ceil((double) userPage.getTotalElements() / limit);
        return new OrgAdminUsersListResponse.Pagination(page, limit, userPage.getTotalElements(), totalPages);
    }

    private Map<UUID, String> companyNames(Set<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return companies.findAllById(ids).stream().collect(Collectors.toMap(OrgCompanyEntity::getId, OrgCompanyEntity::getName));
    }

    private static OrgAdminUserResponse toResponse(OrgUserEntity u, String companyName) {
        return new OrgAdminUserResponse(
                u.getId().toString(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole(),
                u.isActive(),
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null,
                u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null,
                companyName);
    }
}
