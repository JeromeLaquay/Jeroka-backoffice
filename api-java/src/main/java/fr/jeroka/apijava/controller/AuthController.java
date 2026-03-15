package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.auth.AuthResponse;
import fr.jeroka.apijava.dto.auth.LoginRequest;
import fr.jeroka.apijava.dto.auth.RegisterRequest;
import fr.jeroka.apijava.mapping.AuthMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthMappingService authMappingService;

    public AuthController(AuthMappingService authMappingService) {
        this.authMappingService = authMappingService;
    }

    @GetMapping("/me")
    public AuthResponse.UserInfo me(@AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return authMappingService.getMe(UUID.fromString(principal.id()));
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authMappingService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authMappingService.register(request);
    }
}
