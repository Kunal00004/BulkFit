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
public class DashboardResponse {
    private Double currentWeightKg;
    private Double targetWeightKg;
    private Double weightToGoKg;
    private Double todayCaloriesConsumed;
    private Double todayCalorieGoal;
    private boolean todayGoalMet;
    private List<WeightPoint> weightProgression; // last 30 days
    private List<DietLogResponse> recentMeals;
    private List<WorkoutLogResponse> recentWorkouts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeightPoint {
        private String date;
        private Double weightKg;
    }
}
