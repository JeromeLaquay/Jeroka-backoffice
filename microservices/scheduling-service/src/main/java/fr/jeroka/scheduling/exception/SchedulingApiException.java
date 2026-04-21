package fr.jeroka.scheduling.exception;

import org.springframework.http.HttpStatus;

public class SchedulingApiException extends RuntimeException {

    private final HttpStatus status;

    public SchedulingApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
