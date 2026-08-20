package com.bulkfit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private int age;
    private Double heightCm;
    private Double currentWeightKg;
    private Double targetWeightKg;
    private String role;

    // Derived: daily calorie surplus goal for hypertrophy (Mifflin-St Jeor + surplus)
    private Double dailyCalorieGoal;
    private Double dailyProteinGoalGrams;
}
