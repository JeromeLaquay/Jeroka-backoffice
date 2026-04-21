package fr.jeroka.auth.service;

import fr.jeroka.auth.entity.AuthUserEntity;
import fr.jeroka.auth.exception.AuthApiException;
import fr.jeroka.auth.repository.AuthUserRepository;
import fr.jeroka.auth.web.dto.ChangePasswordRequestBody;
import fr.jeroka.auth.web.dto.RegisterRequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Comptes utilisateurs locaux (base jeroka_auth).
 */
@Service
public class AuthUserService {

    private static final Pattern EMAIL = Pattern.compile("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$");

    private final AuthUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthUserService(AuthUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public AuthUserEntity login(String email, String password) {
        var user = users.findFirstByEmailIgnoreCase(trim(email))
                .orElseThrow(() -> new AuthApiException("Identifiants incorrects", HttpStatus.UNAUTHORIZED));
        if (!user.isActive()) {
            throw new AuthApiException("Compte désactivé", HttpStatus.FORBIDDEN);
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthApiException("Identifiants incorrects", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    @Transactional
    public AuthUserEntity register(RegisterRequestBody body) {
        validateRegisterBody(body);
        UUID companyId = resolveCompanyId(body.companyId());
        String email = trim(body.email()).toLowerCase();
        if (users.existsByCompanyIdAndEmail(companyId, email)) {
            throw new AuthApiException(
                    "Un compte existe déjà avec cet email pour cette entreprise", HttpStatus.CONFLICT);
        }
        return users.save(buildNewUser(body, companyId, email));
    }

    @Transactional(readOnly = true)
    public AuthUserEntity getById(UUID userId) {
        return users.findById(userId)
                .orElseThrow(() -> new AuthApiException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public AuthUserEntity updateProfile(UUID userId, String firstName, String lastName) {
        var user = getById(userId);
        user.setFirstName(trim(firstName));
        user.setLastName(trim(lastName));
        return users.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequestBody body) {
        if (body.confirmPassword() != null && !body.confirmPassword().isBlank()
                && !body.newPassword().equals(body.confirmPassword())) {
            throw new AuthApiException("Les mots de passe ne correspondent pas", HttpStatus.BAD_REQUEST);
        }
        if (body.newPassword().equals(body.currentPassword())) {
            throw new AuthApiException("Le nouveau mot de passe doit être différent", HttpStatus.BAD_REQUEST);
        }
        var user = getById(userId);
        if (!passwordEncoder.matches(body.currentPassword(), user.getPasswordHash())) {
            throw new AuthApiException("Mot de passe actuel incorrect", HttpStatus.UNAUTHORIZED);
        }
        user.setPasswordHash(passwordEncoder.encode(body.newPassword()));
        users.save(user);
    }

    private void validateRegisterBody(RegisterRequestBody body) {
        if (body.email() == null || trim(body.email()).isEmpty()) {
            throw new AuthApiException("Email requis", HttpStatus.BAD_REQUEST);
        }
        if (!EMAIL.matcher(trim(body.email())).matches()) {
            throw new AuthApiException("Email invalide", HttpStatus.BAD_REQUEST);
        }
        if (body.password() == null || body.password().length() < 8) {
            throw new AuthApiException("Le mot de passe doit contenir au moins 8 caractères", HttpStatus.BAD_REQUEST);
        }
        String confirm = body.confirmPassword() != null ? body.confirmPassword() : "";
        if (!body.password().equals(confirm)) {
            throw new AuthApiException("Les mots de passe ne correspondent pas", HttpStatus.BAD_REQUEST);
        }
        if (body.firstName() == null || trim(body.firstName()).isEmpty()) {
            throw new AuthApiException("Prénom requis", HttpStatus.BAD_REQUEST);
        }
        if (body.lastName() == null || trim(body.lastName()).isEmpty()) {
            throw new AuthApiException("Nom requis", HttpStatus.BAD_REQUEST);
        }
    }

    private static UUID resolveCompanyId(UUID companyId) {
        if (companyId == null) {
            return UUID.randomUUID();
        }
        return companyId;
    }

    private AuthUserEntity buildNewUser(RegisterRequestBody body, UUID companyId, String email) {
        var u = new AuthUserEntity();
        u.setId(UUID.randomUUID());
        u.setCompanyId(companyId);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(body.password()));
        u.setFirstName(trim(body.firstName()));
        u.setLastName(trim(body.lastName()));
        u.setRole("user");
        u.setActive(true);
        return u;
    }

    private static String trim(String s) {
        return s == null ? "" : s.trim();
    }
}
