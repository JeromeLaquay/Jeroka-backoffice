package fr.jeroka.dashboard.web;

import fr.jeroka.dashboard.exception.DashboardApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletionException;

@RestControllerAdvice
public class DashboardExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(DashboardExceptionHandler.class);

    @ExceptionHandler(DashboardApiException.class)
    public ResponseEntity<Map<String, Object>> handle(DashboardApiException ex) {
        log.warn("DashboardApiException: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(Map.of(
                        "error", ex.getMessage(),
                        "status", ex.getStatus().value(),
                        "timestamp", Instant.now().toString()));
    }

    @ExceptionHandler(CompletionException.class)
    public ResponseEntity<Map<String, Object>> handleCompletion(CompletionException ex) {
        Throwable c = ex.getCause();
        if (c instanceof DashboardApiException d) {
            return handle(d);
        }
        if (c instanceof WebClientResponseException w) {
            log.warn("Erreur HTTP downstream (async): {}", w.getStatusCode());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error", "Service distant indisponible: " + w.getStatusCode(),
                            "status", 502,
                            "timestamp", Instant.now().toString()));
        }
        log.error("CompletionException dashboard-bff", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "error", "Erreur lors de l’agrégation",
                        "status", 502,
                        "timestamp", Instant.now().toString()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleOther(Exception ex) {
        log.error("Erreur dashboard-bff", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Erreur interne",
                        "status", 500,
                        "timestamp", Instant.now().toString()));
    }
}
