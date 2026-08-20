package com.bulkfit.service;

import com.bulkfit.dto.AuthResponse;
import com.bulkfit.dto.LoginRequest;
import com.bulkfit.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
