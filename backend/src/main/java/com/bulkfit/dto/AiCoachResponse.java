package com.bulkfit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCoachResponse {

    private String summary; // short coach-style intro / rationale
    private Double dailyCalorieTarget;
    private Double dailyProteinTargetGrams;

    private List<WorkoutDay> weeklyWorkoutPlan;
    private List<MealDay> weeklyMealPlan;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkoutDay {
        private String day;         // e.g. "Monday"
        private String focus;       // e.g. "Push (Chest/Shoulders/Triceps)"
        private List<String> exercises; // e.g. "Push-Ups - 4x12"
        private boolean restDay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealDay {
        private String day;
        private List<Meal> meals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meal {
        private String mealType; // Breakfast / Lunch / Snacks / Dinner
        private String description;
        private Double estimatedCalories;
    }
}
