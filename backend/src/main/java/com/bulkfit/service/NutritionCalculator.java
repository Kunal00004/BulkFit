package com.bulkfit.service;

import com.bulkfit.entity.User;
import org.springframework.stereotype.Component;

/**
 * BulkFit's core math engine.
 * Uses dynamic Mifflin-St Jeor BMR equation and activity multipliers.
 * Calculates caloric surplus tuned for steady muscle gain.
 */
@Component
public class NutritionCalculator {

    private static final double SURPLUS_CALORIES = 400.0;   // daily surplus for lean bulking
    private static final double PROTEIN_PER_KG_BODYWEIGHT = 2.0; // g/kg for hypertrophy

    public double calculateBmr(User user) {
        double baseBmr = (10 * user.getCurrentWeightKg())
                + (6.25 * user.getHeightCm())
                - (5 * user.getAge());

        // Dynamic calculation based on user's gender
        if (user.getGender() != null && user.getGender().equalsIgnoreCase("FEMALE")) {
            return baseBmr - 161;
        } else {
            return baseBmr + 5; // Default to Male
        }
    }

    public double calculateMaintenanceCalories(User user) {
        double activityMultiplier = 1.2; // Default Sedentary (desk job)

        if (user.getActivityLevel() != null) {
            switch (user.getActivityLevel().toUpperCase()) {
                case "LIGHT":
                    activityMultiplier = 1.375; // Light exercise 1-3 days/week
                    break;
                case "MODERATE":
                    activityMultiplier = 1.55;  // Moderate exercise 3-5 days/week
                    break;
                case "ACTIVE":
                    activityMultiplier = 1.725; // Heavy exercise 6-7 days/week
                    break;
                case "EXTRA_ACTIVE":
                    activityMultiplier = 1.9;   // Very heavy physical job/training
                    break;
                default:
                    activityMultiplier = 1.2;
            }
        }
        return calculateBmr(user) * activityMultiplier;
    }

    public double calculateDailyCalorieGoal(User user) {
        return Math.round(calculateMaintenanceCalories(user) + SURPLUS_CALORIES);
    }

    public double calculateDailyProteinGoalGrams(User user) {
        return Math.round(user.getCurrentWeightKg() * PROTEIN_PER_KG_BODYWEIGHT);
    }
}