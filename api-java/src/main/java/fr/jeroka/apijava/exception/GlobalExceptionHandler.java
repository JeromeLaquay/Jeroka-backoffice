package fr.jeroka.apijava.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorBody> handleApiException(ApiException ex) {
        log.warn("ApiException: {}", ex.getMessage());
        return ResponseEntity
                .status(ex.getStatus())
                .body(ErrorBody.of(ex.getMessage(), ex.getStatus().value()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getAllErrors().stream()
                .filter(FieldError.class::isInstance)
                .map(FieldError.class::cast)
                .collect(Collectors.toMap(FieldError::getField, e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : ""));
        log.warn("Validation failed: {}", errors);
        return ResponseEntity.badRequest().body(ErrorBody.validation(errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorBody.of(ex.getMessage(), 400));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorBody> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Contrainte BDD: {}", ex.getMessage());
        String msg = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("unique")
                ? "Une entreprise avec cet email existe déjà."
                : "Données invalides (contrainte base de données).";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorBody.of(msg, 400));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorBody> handleAuth(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorBody.of("Non autorisé", 401));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorBody> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorBody.of("Ressource introuvable", 404));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorBody.of("Erreur interne", 500));
    }

    public record ErrorBody(String error, int status, String timestamp, Map<String, String> errors) {

        public static ErrorBody of(String error, int status) {
            return new ErrorBody(error, status, Instant.now().toString(), null);
        }

        public static ErrorBody validation(Map<String, String> errors) {
            return new ErrorBody("Erreur de validation", 400, Instant.now().toString(), errors);
        }
    }
}
