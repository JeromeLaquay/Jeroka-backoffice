package fr.jeroka.coreforward;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.client.RestClient;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Transfère la requête vers le core si l’URI correspond à un motif configuré.
 */
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class JerokaCoreForwardFilter extends OncePerRequestFilter {

    private static final Set<String> HOP_HEADERS = new HashSet<>(Arrays.asList(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length"));

    private final AntPathMatcher matcher = new AntPathMatcher();
    private final JerokaCoreForwardProperties properties;
    private final RestClient restClient = RestClient.create();

    public JerokaCoreForwardFilter(JerokaCoreForwardProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String uri = request.getRequestURI();
        if (uri.startsWith("/actuator")) {
            return true;
        }
        if (properties.getPatterns() == null || properties.getPatterns().isEmpty()) {
            return true;
        }
        return properties.getPatterns().stream().noneMatch(p -> matcher.match(p, uri));
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String base = trimSlash(properties.getCoreApiBaseUrl());
        String uri = request.getRequestURI();
        String q = request.getQueryString();
        String target = base + uri + (q != null && !q.isBlank() ? "?" + q : "");

        byte[] body = readBodyIfNeeded(request);

        var method = HttpMethod.valueOf(request.getMethod());
        var spec = restClient.method(method).uri(target);
        spec = spec.headers(h -> copyRequestHeaders(request, h));
        if (body.length > 0 && allowsBody(method)) {
            spec = spec.body(body);
        }

        try {
            ResponseEntity<byte[]> resp = spec.retrieve().toEntity(byte[].class);
            writeProxyResponse(response, resp);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_GATEWAY);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Forward core indisponible: " + e.getMessage());
        }
    }

    private static byte[] readBodyIfNeeded(HttpServletRequest request) throws IOException {
        if (!allowsBody(HttpMethod.valueOf(request.getMethod()))) {
            return new byte[0];
        }
        return request.getInputStream().readAllBytes();
    }

    private static void writeProxyResponse(HttpServletResponse response, ResponseEntity<byte[]> resp) throws IOException {
        response.setStatus(resp.getStatusCode().value());
        if (resp.getHeaders().getContentType() != null) {
            response.setContentType(resp.getHeaders().getContentType().toString());
        }
        resp.getHeaders().forEach((name, values) -> {
            if (values.isEmpty() || HOP_HEADERS.contains(name.toLowerCase())) {
                return;
            }
            if (HttpHeaders.SET_COOKIE.equalsIgnoreCase(name)) {
                values.forEach(v -> response.addHeader(name, v));
            } else {
                response.setHeader(name, values.get(0));
            }
        });
        byte[] out = resp.getBody();
        if (out != null && out.length > 0) {
            response.getOutputStream().write(out);
        }
    }

    private static boolean allowsBody(HttpMethod method) {
        return method == HttpMethod.POST || method == HttpMethod.PUT
                || method == HttpMethod.PATCH || method == HttpMethod.DELETE;
    }

    private static void copyRequestHeaders(HttpServletRequest request, HttpHeaders h) {
        java.util.Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (HOP_HEADERS.contains(name.toLowerCase())) {
                continue;
            }
            java.util.Enumeration<String> vals = request.getHeaders(name);
            while (vals.hasMoreElements()) {
                h.add(name, vals.nextElement());
            }
        }
    }

    private static String trimSlash(String u) {
        if (u == null || u.isBlank()) {
            return "";
        }
        String t = u.trim();
        while (t.endsWith("/")) {
            t = t.substring(0, t.length() - 1);
        }
        return t;
    }
}
