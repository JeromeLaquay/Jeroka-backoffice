package fr.jeroka.auth.web;

import fr.jeroka.auth.jwks.RsaJwtIssuerService;
import fr.jeroka.auth.security.AuthPrincipal;
import fr.jeroka.auth.service.AuthUserService;
import fr.jeroka.auth.web.dto.AuthResponseBody;
import fr.jeroka.auth.web.dto.ChangePasswordRequestBody;
import fr.jeroka.auth.web.dto.LoginRequestBody;
import fr.jeroka.auth.web.dto.RegisterRequestBody;
import fr.jeroka.auth.web.dto.UpdateProfileRequestBody;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Auth publique et profil (base jeroka_auth, JWT RS256 local).
 */
@RestController
public class AuthApiController {

    private final AuthUserService authUserService;
    private final RsaJwtIssuerService rsaJwtIssuerService;

    public AuthApiController(AuthUserService authUserService, RsaJwtIssuerService rsaJwtIssuerService) {
        this.authUserService = authUserService;
        this.rsaJwtIssuerService = rsaJwtIssuerService;
    }

    @PostMapping("/api/v1/auth/login")
    public AuthResponseBody login(@Valid @RequestBody LoginRequestBody body) {
        var user = authUserService.login(body.email(), body.password());
        return buildAuthResponse(user);
    }

    @PostMapping("/api/v1/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseBody register(@RequestBody RegisterRequestBody body) {
        var user = authUserService.register(body);
        return buildAuthResponse(user);
    }

    @GetMapping("/api/v1/auth/me")
    public AuthResponseBody.UserInfo me(@AuthenticationPrincipal AuthPrincipal principal) {
        return toUserInfo(authUserService.getById(principal.userId()));
    }

    @GetMapping("/api/v1/auth/profile")
    public AuthResponseBody.UserInfo profile(@AuthenticationPrincipal AuthPrincipal principal) {
        return toUserInfo(authUserService.getById(principal.userId()));
    }

    @PutMapping("/api/v1/auth/profile")
    public AuthResponseBody.UserInfo updateProfile(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody UpdateProfileRequestBody body) {
        var user = authUserService.updateProfile(principal.userId(), body.firstName(), body.lastName());
        return toUserInfo(user);
    }

    @PutMapping("/api/v1/auth/change-password")
    public Map<String, Boolean> changePassword(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ChangePasswordRequestBody body) {
        authUserService.changePassword(principal.userId(), body);
        return Map.of("success", true);
    }

    @PostMapping("/api/v1/auth/logout")
    public Map<String, Boolean> logout() {
        return Map.of("success", true);
    }

    @PostMapping("/api/v1/auth/refresh")
    public Map<String, Object> refresh(@AuthenticationPrincipal AuthPrincipal principal) {
        var user = authUserService.getById(principal.userId());
        String token = issueToken(user);
        return Map.of("success", true, "data", Map.of("accessToken", token));
    }

    private AuthResponseBody buildAuthResponse(fr.jeroka.auth.entity.AuthUserEntity user) {
        return AuthResponseBody.of(issueToken(user), toUserInfo(user));
    }

    private String issueToken(fr.jeroka.auth.entity.AuthUserEntity user) {
        return rsaJwtIssuerService.issueAccessToken(
                user.getId().toString(),
                user.getEmail(),
                user.getRole(),
                user.getCompanyId().toString());
    }

    private static AuthResponseBody.UserInfo toUserInfo(fr.jeroka.auth.entity.AuthUserEntity user) {
        return new AuthResponseBody.UserInfo(
                user.getId().toString(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCompanyId().toString());
    }
}
