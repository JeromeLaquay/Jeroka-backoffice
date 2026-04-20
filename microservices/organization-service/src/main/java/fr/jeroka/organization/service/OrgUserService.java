package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgUserEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgUserRepository;
import fr.jeroka.organization.web.dto.common.PageDto;
import fr.jeroka.organization.web.dto.user.OrgCreateUserRequest;
import fr.jeroka.organization.web.dto.user.OrgUpdateUserRequest;
import fr.jeroka.organization.web.dto.user.OrgUserResponse;
import fr.jeroka.organization.web.dto.user.OrgUserStatsResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class OrgUserService {

    private final OrgUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OrgUserService(OrgUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public PageDto<OrgUserResponse> listByCompany(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = userRepository.findByCompanyId(companyId, p);
        var items = result.getContent().stream().map(OrgUserService::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    public OrgUserResponse getById(UUID id, UUID companyId) {
        return toResponse(requireInCompany(id, companyId));
    }

    @Transactional
    public OrgUserResponse create(UUID companyId, OrgCreateUserRequest req) {
        if (userRepository.existsByCompanyIdAndEmail(companyId, normalizedEmail(req.email()))) {
            throw new OrgApiException(
                    "Un utilisateur existe déjà avec cet email dans cette entreprise", HttpStatus.CONFLICT);
        }
        OrgUserEntity u = new OrgUserEntity();
        u.setCompanyId(companyId);
        u.setEmail(normalizedEmail(req.email()));
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setFirstName(req.firstName().trim());
        u.setLastName(req.lastName().trim());
        u.setRole(roleOrDefault(req.role()));
        u.setActive(true);
        return toResponse(userRepository.save(u));
    }

    @Transactional
    public OrgUserResponse update(UUID id, UUID companyId, OrgUpdateUserRequest req) {
        OrgUserEntity u = requireInCompany(id, companyId);
        if (req.email() != null && !req.email().isBlank()) {
            String nextEmail = normalizedEmail(req.email());
            if (!nextEmail.equals(u.getEmail())
                    && userRepository.existsOtherWithEmail(companyId, nextEmail, id)) {
                throw new OrgApiException(
                        "Un utilisateur existe déjà avec cet email dans cette entreprise", HttpStatus.CONFLICT);
            }
        }
        applyUpdate(u, req);
        return toResponse(userRepository.save(u));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        OrgUserEntity u = requireInCompany(id, companyId);
        userRepository.delete(u);
    }

    @Transactional
    public OrgUserResponse toggleStatus(UUID id, UUID companyId) {
        OrgUserEntity u = requireInCompany(id, companyId);
        u.setActive(!u.isActive());
        return toResponse(userRepository.save(u));
    }

    public OrgUserStatsResponse stats(UUID companyId) {
        long total = userRepository.countByCompanyId(companyId);
        long active = userRepository.countByCompanyIdAndActiveTrue(companyId);
        long admins = userRepository.countByCompanyIdAndRole(companyId, "admin");
        long users = userRepository.countByCompanyIdAndRole(companyId, "user");
        Instant startOfMonth = Instant.now().atZone(ZoneOffset.UTC).withDayOfMonth(1).toInstant();
        long newThisMonth = userRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        return new OrgUserStatsResponse(total, active, total - active, admins, users, newThisMonth);
    }

    private OrgUserEntity requireInCompany(UUID id, UUID companyId) {
        return userRepository
                .findById(id)
                .filter(u -> u.getCompanyId().equals(companyId))
                .orElseThrow(() -> new OrgApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    private static void applyUpdate(OrgUserEntity u, OrgUpdateUserRequest req) {
        if (req.firstName() != null && !req.firstName().isBlank()) {
            u.setFirstName(req.firstName().trim());
        }
        if (req.lastName() != null && !req.lastName().isBlank()) {
            u.setLastName(req.lastName().trim());
        }
        if (req.email() != null && !req.email().isBlank()) {
            u.setEmail(normalizedEmail(req.email()));
        }
        if (req.role() != null && !req.role().isBlank()) {
            u.setRole(req.role());
        }
    }

    private static String normalizedEmail(String email) {
        return email.trim().toLowerCase();
    }

    private static String roleOrDefault(String role) {
        return role != null && !role.isBlank() ? role : "user";
    }

    private static OrgUserResponse toResponse(OrgUserEntity u) {
        return new OrgUserResponse(
                u.getId().toString(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole(),
                u.getCompanyId().toString(),
                u.isActive(),
                u.getCreatedAt(),
                u.getUpdatedAt());
    }
}
