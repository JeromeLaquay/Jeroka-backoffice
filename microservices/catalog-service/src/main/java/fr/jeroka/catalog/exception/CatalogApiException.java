package fr.jeroka.catalog.exception;

import org.springframework.http.HttpStatus;

public class CatalogApiException extends RuntimeException {

    private final HttpStatus status;

    public CatalogApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
