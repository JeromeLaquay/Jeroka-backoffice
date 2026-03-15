package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.user.*;
import fr.jeroka.apijava.entity.User;
import fr.jeroka.apijava.service.UserService;
import fr.jeroka.apijava.service.UserStats;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Couche mapping User : DTO &lt;-&gt; entités.
 * Controller -&gt; UserMappingService -&gt; UserService -&gt; Repository.
 */
@Service
public class UserMappingService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserMappingService(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public PageDto<UserResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = userService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toUserResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public UserResponse getById(UUID id, UUID companyId) {
        var user = userService.getByIdAndCompanyId(id, companyId);
        return toUserResponse(user);
    }

    public UserResponse create(CreateUserRequest request) {
        var user = toEntity(request);
        var saved = userService.create(user);
        return toUserResponse(saved);
    }

    public UserResponse update(UUID id, UUID companyId, UpdateUserRequest request) {
        var user = userService.getByIdAndCompanyId(id, companyId);
        applyUpdate(user, request);
        return toUserResponse(userService.update(user));
    }

    public void delete(UUID id, UUID companyId) {
        userService.getByIdAndCompanyId(id, companyId);
        userService.delete(id);
    }

    public UserResponse toggleStatus(UUID id, UUID companyId) {
        var user = userService.toggleStatus(id);
        if (!user.getCompanyId().equals(companyId)) {
            throw new IllegalStateException("Utilisateur hors entreprise");
        }
        return toUserResponse(user);
    }

    public UserStatsResponse getStats(UUID companyId) {
        var stats = userService.getStats(companyId);
        return new UserStatsResponse(
                stats.total(),
                stats.active(),
                stats.inactive(),
                stats.admins(),
                stats.users(),
                stats.newThisMonth()
        );
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCompanyId().toString(),
                Boolean.TRUE.equals(user.getIsActive()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private User toEntity(CreateUserRequest request) {
        var user = new User();
        user.setCompanyId(request.companyId());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setRole(request.role() != null && !request.role().isBlank() ? request.role() : "user");
        user.setIsActive(true);
        return user;
    }

    private void applyUpdate(User user, UpdateUserRequest request) {
        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            user.setEmail(request.email().trim().toLowerCase());
        }
        if (request.role() != null && !request.role().isBlank()) {
            user.setRole(request.role());
        }
    }
}
