package com.bulkfit.service;

import com.bulkfit.entity.User;
import org.springframework.stereotype.Component;

/**
 * BulkFit's core math engine.
 *
 * Persona baseline: young male, home-based progressive overload, aiming for a LEAN BULK.
 * Uses Mifflin-St Jeor BMR, a home-workout activity multiplier (moderate - no gym machines,
 * mostly bodyweight/calisthenics), and a fixed caloric surplus tuned for steady muscle gain
 * (~0.25-0.5 kg/week) without excessive fat gain.
 */
@Component
public class NutritionCalculator {

    private static final double ACTIVITY_MULTIPLIER = 1.55; // moderate home workouts, 4-5x/week
    private static final double SURPLUS_CALORIES = 400.0;   // daily surplus for lean bulking
    private static final double PROTEIN_PER_KG_BODYWEIGHT = 2.0; // g/kg for hypertrophy

    /**
     * Mifflin-St Jeor equation (male):
     * BMR = 10*weight(kg) + 6.25*height(cm) - 5*age + 5
     */
    public double calculateBmr(User user) {
        return (10 * user.getCurrentWeightKg())
                + (6.25 * user.getHeightCm())
                - (5 * user.getAge())
                + 5;
    }

    public double calculateMaintenanceCalories(User user) {
        return calculateBmr(user) * ACTIVITY_MULTIPLIER;
    }

    /** Daily calorie goal = maintenance + surplus, to drive weight gain. */
    public double calculateDailyCalorieGoal(User user) {
        return Math.round(calculateMaintenanceCalories(user) + SURPLUS_CALORIES);
    }

    /** Protein goal for muscle protein synthesis, based on current bodyweight. */
    public double calculateDailyProteinGoalGrams(User user) {
        return Math.round(user.getCurrentWeightKg() * PROTEIN_PER_KG_BODYWEIGHT);
    }
}
