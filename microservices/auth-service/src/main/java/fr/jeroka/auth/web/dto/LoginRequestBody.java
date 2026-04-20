package fr.jeroka.auth.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LoginRequestBody(
        @NotBlank(message = "Email requis") @Email String email,
        @NotBlank(message = "Mot de passe requis") String password,
        Boolean rememberMe
) {}
