package fr.jeroka.dashboard.exception;

import org.springframework.http.HttpStatus;

public class DashboardApiException extends RuntimeException {

    private final HttpStatus status;

    public DashboardApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
