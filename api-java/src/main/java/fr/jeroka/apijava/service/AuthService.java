package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.auth.LoginRequest;
import fr.jeroka.apijava.dto.auth.RegisterRequest;
import fr.jeroka.apijava.entity.Company;
import fr.jeroka.apijava.entity.User;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.CompanyRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Métier Auth : travaille sur les entités User/Company uniquement.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;

    public User getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       CompanyRepository companyRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User login(LoginRequest request) {
        var user = userRepository.findFirstByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException("Identifiants incorrects", HttpStatus.UNAUTHORIZED));
        if (!user.getIsActive()) {
            throw new ApiException("Compte désactivé", HttpStatus.FORBIDDEN);
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException("Identifiants incorrects", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    @Transactional
    public User register(RegisterRequest request) {
        var companyId = resolveCompanyId(request.companyId());
        ensureEmailNotUsed(companyId, request.email());
        var user = mapToUser(request, companyId);
        return userRepository.save(user);
    }

    private UUID resolveCompanyId(UUID companyId) {
        if (companyId == null) {
            var company = new Company();
            company.setName("Ma société");
            companyRepository.save(company);
            return company.getId();
        }
        if (companyRepository.findById(companyId).isEmpty()) {
            throw new ApiException("Entreprise introuvable", HttpStatus.BAD_REQUEST);
        }
        return companyId;
    }

    private void ensureEmailNotUsed(UUID companyId, String email) {
        if (userRepository.existsByCompanyIdAndEmail(companyId, email)) {
            throw new ApiException("Un compte existe déjà avec cet email pour cette entreprise", HttpStatus.CONFLICT);
        }
    }

    private User mapToUser(RegisterRequest request, UUID companyId) {
        var user = new User();
        user.setCompanyId(companyId);
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setRole("user");
        user.setIsActive(true);
        return user;
    }

    @Transactional
    public User updateProfile(UUID userId, String firstName, String lastName) {
        var user = getById(userId);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        return userRepository.save(user);
    }
}
