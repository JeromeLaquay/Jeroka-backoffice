package fr.jeroka.organization.web;

import fr.jeroka.organization.exception.OrgApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class OrgExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(OrgExceptionHandler.class);

    @ExceptionHandler(OrgApiException.class)
    public ResponseEntity<Map<String, Object>> handle(OrgApiException ex) {
        log.warn("OrgApiException: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(Map.of(
                        "error", ex.getMessage(),
                        "status", ex.getStatus().value(),
                        "timestamp", Instant.now().toString()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleOther(Exception ex) {
        log.error("Erreur organization-service", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Erreur interne",
                        "status", 500,
                        "timestamp", Instant.now().toString()));
    }
}
