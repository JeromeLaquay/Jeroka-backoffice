package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.auth.AuthResponse;
import fr.jeroka.apijava.dto.auth.LoginRequest;
import fr.jeroka.apijava.dto.auth.RegisterRequest;
import fr.jeroka.apijava.entity.User;
import fr.jeroka.apijava.security.JwtService;
import fr.jeroka.apijava.service.AuthService;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Couche mapping Auth : DTO &lt;-&gt; métier.
 * Controller -&gt; AuthMappingService -&gt; AuthService -&gt; Repository.
 */
@Service
public class AuthMappingService {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthMappingService(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        var user = authService.login(request);
        return toAuthResponse(user);
    }

    public AuthResponse register(RegisterRequest request) {
        var user = authService.register(request);
        return toAuthResponse(user);
    }

    public AuthResponse.UserInfo getMe(UUID userId) {
        var user = authService.getById(userId);
        return new AuthResponse.UserInfo(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCompanyId().toString());
    }

    public AuthResponse toAuthResponse(User user) {
        var token = jwtService.generateAccessToken(
                user.getId().toString(),
                user.getEmail(),
                user.getRole(),
                user.getCompanyId().toString());
        var info = new AuthResponse.UserInfo(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCompanyId().toString());
        return new AuthResponse(token, AuthResponse.TOKEN_TYPE, info);
    }
}
