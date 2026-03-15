package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.User;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Métier User : entités et repository uniquement.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<User> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return userRepository.findByCompanyId(companyId, p);
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    public User getByIdAndCompanyId(UUID id, UUID companyId) {
        return userRepository.findById(id)
                .filter(u -> u.getCompanyId().equals(companyId))
                .orElseThrow(() -> new ApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public User create(User user) {
        if (userRepository.existsByCompanyIdAndEmail(user.getCompanyId(), user.getEmail())) {
            throw new ApiException("Un utilisateur existe déjà avec cet email dans cette entreprise", HttpStatus.CONFLICT);
        }
        return userRepository.save(user);
    }

    @Transactional
    public User update(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public User toggleStatus(UUID id) {
        var user = getById(id);
        user.setIsActive(Boolean.FALSE.equals(user.getIsActive()));
        return userRepository.save(user);
    }

    public UserStats getStats(UUID companyId) {
        var total = userRepository.countByCompanyId(companyId);
        var active = userRepository.countByCompanyIdAndIsActiveTrue(companyId);
        var admins = userRepository.countByCompanyIdAndRole(companyId, "admin");
        var users = userRepository.countByCompanyIdAndRole(companyId, "user");
        var startOfMonth = Instant.now().atZone(ZoneOffset.UTC).withDayOfMonth(1).toInstant();
        var newThisMonth = userRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        return new UserStats(total, active, total - active, admins, users, newThisMonth);
    }
}
