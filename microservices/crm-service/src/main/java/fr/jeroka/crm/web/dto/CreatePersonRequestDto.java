package fr.jeroka.crm.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePersonRequestDto(
        @Pattern(regexp = "individual|company", message = "type_client invalide") String typeClient,
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @NotBlank(message = "Email requis") @Email String email,
        @Size(max = 200) String companyName,
        @Size(max = 20) String phone,
        @Size(max = 20) String mobile,
        @Size(max = 255) String website,
        @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        @Size(max = 14) String siret,
        @Size(max = 50) String vatNumber,
        @Pattern(regexp = "active|inactive|prospect", message = "status invalide") String status,
        @Size(max = 50) String source,
        String notes
) {}
