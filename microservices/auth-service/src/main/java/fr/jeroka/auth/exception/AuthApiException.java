package fr.jeroka.auth.exception;

import org.springframework.http.HttpStatus;

/**
 * Erreur métier auth (alignée sur les statuts HTTP du core).
 */
public class AuthApiException extends RuntimeException {

    private final HttpStatus status;

    public AuthApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
