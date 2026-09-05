package com.bulkfit.controller;

import com.bulkfit.dto.AuthResponse;
import com.bulkfit.dto.LoginRequest;
import com.bulkfit.dto.RegisterRequest;
import com.bulkfit.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
    @GetMapping("/ping")
    public ResponseEntity<String> keepAwake() {
        return ResponseEntity.ok("Server is awake and lifting heavy!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
