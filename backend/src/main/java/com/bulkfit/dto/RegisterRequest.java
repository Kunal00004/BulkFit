package com.bulkfit.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Min(value = 13, message = "Age must be at least 13")
    @Max(value = 100, message = "Age must be realistic")
    private int age;

    // Naye Generic Fields Add Kiye
    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Activity level is required")
    private String activityLevel;

    @Positive(message = "Height must be positive")
    private Double heightCm;

    @Positive(message = "Current weight must be positive")
    private Double currentWeightKg;

    @Positive(message = "Target weight must be positive")
    private Double targetWeightKg;
}