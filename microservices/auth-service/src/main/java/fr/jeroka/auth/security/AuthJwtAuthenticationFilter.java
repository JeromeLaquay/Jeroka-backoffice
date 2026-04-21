package fr.jeroka.auth.security;

import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.SignedJWT;
import fr.jeroka.auth.jwks.JwksKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.UUID;

/**
 * Valide le JWT RS256 émis par ce service et remplit le {@link SecurityContextHolder}.
 */
public class AuthJwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwksKeyService jwksKeyService;

    public AuthJwtAuthenticationFilter(JwksKeyService jwksKeyService) {
        this.jwksKeyService = jwksKeyService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/login")
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/.well-known/")
                || path.startsWith("/actuator/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            var verifier = new RSASSAVerifier(jwksKeyService.currentSigningKey().toRSAPublicKey());
            if (!jwt.verify(verifier)) {
                filterChain.doFilter(request, response);
                return;
            }
            var exp = jwt.getJWTClaimsSet().getExpirationTime();
            if (exp != null && !exp.after(new Date())) {
                filterChain.doFilter(request, response);
                return;
            }
            var sub = jwt.getJWTClaimsSet().getSubject();
            var email = (String) jwt.getJWTClaimsSet().getClaim("email");
            var role = (String) jwt.getJWTClaimsSet().getClaim("role");
            var companyIdStr = (String) jwt.getJWTClaimsSet().getClaim("companyId");
            if (sub == null || companyIdStr == null) {
                filterChain.doFilter(request, response);
                return;
            }
            var principal = new AuthPrincipal(UUID.fromString(sub), email, role, UUID.fromString(companyIdStr));
            var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
