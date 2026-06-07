package com.nconnect.coreservice.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (message.contains("Username already taken")) status = HttpStatus.CONFLICT;
        if (message.contains("User not found")) status = HttpStatus.NOT_FOUND;
        if (message.contains("not found")) status = HttpStatus.NOT_FOUND;
        if (message.contains("Only NGO")) status = HttpStatus.FORBIDDEN;
        if (message.contains("complete onboarding")) status = HttpStatus.FORBIDDEN;
        if (message.contains("Failed to sync")) status = HttpStatus.BAD_GATEWAY;
        if (message.contains("Admin access required")) status = HttpStatus.FORBIDDEN;

        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }
}