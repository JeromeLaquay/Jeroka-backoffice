package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.admin.AdminUserResponse;
import fr.jeroka.apijava.dto.admin.CreateAdminUserRequest;
import fr.jeroka.apijava.dto.admin.UpdateAdminUserRequest;
import fr.jeroka.apijava.entity.Company;
import fr.jeroka.apijava.entity.User;
import fr.jeroka.apijava.repository.CompanyRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository, CompanyRepository companyRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResult list(String search, String status, String role, int page, int limit, String sortBy, String sortOrder) {
        String sortProperty = mapSortProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.min(50, Math.max(1, limit)), Sort.by(direction, sortProperty));

        String searchTrim = (search != null && !search.isBlank()) ? search.trim() : null;
        Boolean active = mapStatusToActive(status);
        String roleFilter = (role != null && !role.isBlank()) ? role.trim() : null;

        Page<User> userPage = userRepository.findAdminUsers(searchTrim, active, roleFilter, pageable);
        List<User> users = userPage.getContent();
        Set<java.util.UUID> companyIds = users.stream().map(User::getCompanyId).collect(Collectors.toSet());
        Map<java.util.UUID, String> companyNames = companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(Company::getId, Company::getName));

        List<AdminUserResponse> items = users.stream()
                .map(u -> toResponse(u, companyNames.get(u.getCompanyId())))
                .toList();

        int totalPages = (int) Math.ceil((double) userPage.getTotalElements() / limit);
        return new PageResult(items, userPage.getNumber() + 1, limit, userPage.getTotalElements(), totalPages);
    }

    private static String mapSortProperty(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return "created_at".equals(sortBy) ? "createdAt" : sortBy;
    }

    private static Boolean mapStatusToActive(String status) {
        if (status == null || status.isBlank()) return null;
        return "active".equalsIgnoreCase(status.trim());
    }

    private static AdminUserResponse toResponse(User u, String companyName) {
        return new AdminUserResponse(
                u.getId().toString(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getRole(),
                Boolean.TRUE.equals(u.getIsActive()),
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null,
                u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null,
                companyName
        );
    }

    public AdminUserResponse create(CreateAdminUserRequest req) {
        UUID companyId = UUID.fromString(req.company_id().trim());
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable: " + companyId));
        User user = new User();
        user.setCompanyId(companyId);
        user.setEmail(req.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.first_name().trim());
        user.setLastName(req.last_name().trim());
        user.setRole(req.role() != null && !req.role().isBlank() ? req.role().trim() : "user");
        user.setIsActive(true);
        user = userRepository.save(user);
        return toResponse(user, company.getName());
    }

    public AdminUserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        String companyName = companyRepository.findById(user.getCompanyId()).map(Company::getName).orElse(null);
        return toResponse(user, companyName);
    }

    public AdminUserResponse update(UUID id, UpdateAdminUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        if (req.first_name() != null && !req.first_name().isBlank()) user.setFirstName(req.first_name().trim());
        if (req.last_name() != null && !req.last_name().isBlank()) user.setLastName(req.last_name().trim());
        if (req.email() != null && !req.email().isBlank()) user.setEmail(req.email().trim().toLowerCase());
        if (req.role() != null && !req.role().isBlank()) user.setRole(req.role().trim());
        if (req.is_active() != null) user.setIsActive(req.is_active());
        user = userRepository.save(user);
        String companyName = companyRepository.findById(user.getCompanyId()).map(Company::getName).orElse(null);
        return toResponse(user, companyName);
    }

    public AdminUserResponse toggleStatus(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable: " + id));
        user.setIsActive(Boolean.FALSE.equals(user.getIsActive()));
        user = userRepository.save(user);
        String companyName = companyRepository.findById(user.getCompanyId()).map(Company::getName).orElse(null);
        return toResponse(user, companyName);
    }

    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur introuvable: " + id);
        }
        userRepository.deleteById(id);
    }

    public record PageResult(
            List<AdminUserResponse> data,
            int page,
            int limit,
            long total,
            int totalPages
    ) {}
}
