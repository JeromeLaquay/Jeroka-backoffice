package fr.jeroka.organization.exception;

import org.springframework.http.HttpStatus;

public class OrgApiException extends RuntimeException {

    private final HttpStatus status;

    public OrgApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
