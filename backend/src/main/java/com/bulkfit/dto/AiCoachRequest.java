package com.bulkfit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * User intake for generating a personalized AI coaching plan.
 * Weight/height are NOT collected here - they're pulled server-side from the
 * authenticated user's profile via UserService, so the client can't spoof them.
 */
@Data
public class AiCoachRequest {

    @NotBlank(message = "Goal is required")
    private String goal; // e.g. "Lean Bulk", "Fat Loss", "Body Recomposition"

    @NotBlank(message = "Diet preference is required")
    private String dietPreference; // e.g. "Veg", "Vegan", "Non-Veg"

    @NotBlank(message = "Workout style is required")
    private String workoutStyle; // e.g. "Home", "Gym"
}
