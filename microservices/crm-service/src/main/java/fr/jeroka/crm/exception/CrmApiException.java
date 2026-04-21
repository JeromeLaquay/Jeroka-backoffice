package fr.jeroka.crm.exception;

import org.springframework.http.HttpStatus;

public class CrmApiException extends RuntimeException {

    private final HttpStatus status;

    public CrmApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
