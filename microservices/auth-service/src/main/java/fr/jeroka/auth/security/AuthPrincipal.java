package fr.jeroka.auth.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Principal JWT (claims alignés sur l’émetteur RS256).
 */
public class AuthPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String role;
    private final UUID companyId;

    public AuthPrincipal(UUID userId, String email, String role, UUID companyId) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.companyId = companyId;
    }

    public UUID userId() {
        return userId;
    }

    public String email() {
        return email;
    }

    public String role() {
        return role;
    }

    public UUID companyId() {
        return companyId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null || role.isBlank()) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return userId.toString();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
