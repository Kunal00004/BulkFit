package com.bulkfit.service.impl;

import com.bulkfit.dto.*;
import com.bulkfit.entity.User;
import com.bulkfit.exception.DuplicateResourceException;
import com.bulkfit.repository.UserRepository;
import com.bulkfit.security.JwtUtils;
import com.bulkfit.security.UserPrincipal;
import com.bulkfit.service.AuthService;
import com.bulkfit.service.NutritionCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final NutritionCalculator nutritionCalculator;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        // Updated Builder with General Fields
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .age(request.getAge())
                .gender(request.getGender()) // Added
                .activityLevel(request.getActivityLevel()) // Added
                .heightCm(request.getHeightCm())
                .currentWeightKg(request.getCurrentWeightKg())
                .targetWeightKg(request.getTargetWeightKg())
                .role("ROLE_USER") // Fixed Role
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtils.generateTokenFromEmail(saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(saved))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateJwtToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .age(user.getAge())
                .heightCm(user.getHeightCm())
                .currentWeightKg(user.getCurrentWeightKg())
                .targetWeightKg(user.getTargetWeightKg())
                .role(user.getRole())
                .dailyCalorieGoal(nutritionCalculator.calculateDailyCalorieGoal(user))
                .dailyProteinGoalGrams(nutritionCalculator.calculateDailyProteinGoalGrams(user))
                .build();
    }
}