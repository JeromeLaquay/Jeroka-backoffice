package fr.jeroka.billing.exception;

import org.springframework.http.HttpStatus;

public class BillingApiException extends RuntimeException {

    private final HttpStatus status;

    public BillingApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
