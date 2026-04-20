package fr.jeroka.auth.web;

import fr.jeroka.auth.exception.AuthApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class AuthExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(AuthExceptionHandler.class);

    @ExceptionHandler(AuthApiException.class)
    public ResponseEntity<ErrorBody> handleAuth(AuthApiException ex) {
        log.warn("AuthApiException: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(ErrorBody.of(ex.getMessage(), ex.getStatus().value()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : ""));
        return ResponseEntity.badRequest().body(ErrorBody.validation(errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> handleOther(Exception ex) {
        log.error("Erreur inattendue", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorBody.of("Erreur interne", 500));
    }

    public record ErrorBody(String error, int status, String timestamp, Map<String, String> errors) {

        static ErrorBody of(String error, int status) {
            return new ErrorBody(error, status, Instant.now().toString(), null);
        }

        static ErrorBody validation(Map<String, String> errors) {
            return new ErrorBody("Erreur de validation", 400, Instant.now().toString(), errors);
        }
    }
}
