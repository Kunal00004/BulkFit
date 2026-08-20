package com.bulkfit.service.impl;

import com.bulkfit.dto.UserResponse;
import com.bulkfit.dto.WeightUpdateRequest;
import com.bulkfit.entity.User;
import com.bulkfit.exception.ResourceNotFoundException;
import com.bulkfit.repository.UserRepository;
import com.bulkfit.security.UserPrincipal;
import com.bulkfit.service.NutritionCalculator;
import com.bulkfit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final NutritionCalculator nutritionCalculator;

    @Override
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public UserResponse getCurrentUser() {
        return toResponse(getCurrentUserEntity());
    }

    @Override
    @Transactional
    public UserResponse updateWeight(WeightUpdateRequest request) {
        User user = getCurrentUserEntity();
        user.setCurrentWeightKg(request.getCurrentWeightKg());
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    private UserResponse toResponse(User user) {
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
