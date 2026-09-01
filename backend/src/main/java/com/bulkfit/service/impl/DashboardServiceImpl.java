package com.bulkfit.service.impl;

import com.bulkfit.dto.DashboardResponse;
import com.bulkfit.dto.DietLogResponse;
import com.bulkfit.dto.WorkoutLogResponse;
import com.bulkfit.entity.DietLog;
import com.bulkfit.entity.User;
import com.bulkfit.repository.DietLogRepository;
import com.bulkfit.repository.WorkoutLogRepository;
import com.bulkfit.service.DashboardService;
import com.bulkfit.service.DietService;
import com.bulkfit.service.NutritionCalculator;
import com.bulkfit.service.UserService;
import com.bulkfit.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int PROGRESSION_DAYS = 30;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final UserService userService;
    private final DietLogRepository dietLogRepository;
    private final NutritionCalculator nutritionCalculator;
    private final DietService dietService;
    private final WorkoutService workoutService;

    @Override
    @Transactional(readOnly = true) // Yeh add kiya taaki FoodItem details lazily load ho sake bina crash hue
    public DashboardResponse getDashboard() {
        User user = userService.getCurrentUserEntity();

        double calorieGoal = nutritionCalculator.calculateDailyCalorieGoal(user);
        List<DietLog> todayLogs = dietLogRepository.findByUserAndLogDateOrderByIdDesc(user, LocalDate.now());
        double todayCalories = todayLogs.stream().mapToDouble(DietLog::getComputedCalories).sum();

        List<DietLogResponse> recentMeals = dietService.getRecentMeals(5);
        List<WorkoutLogResponse> recentWorkouts = workoutService.getRecentWorkouts(5);

        return DashboardResponse.builder()
                .currentWeightKg(user.getCurrentWeightKg())
                .targetWeightKg(user.getTargetWeightKg())
                .weightToGoKg(Math.round((user.getTargetWeightKg() - user.getCurrentWeightKg()) * 10.0) / 10.0)
                .todayCaloriesConsumed(Math.round(todayCalories * 10.0) / 10.0)
                .todayCalorieGoal(calorieGoal)
                .todayGoalMet(todayCalories >= calorieGoal)
                .weightProgression(buildWeightProgression(user))
                .recentMeals(recentMeals)
                .recentWorkouts(recentWorkouts)
                .build();
    }

    /**
     * Synthesizes a smooth, generic progression trend line for the UI chart.
     * Replaces the hardcoded persona values with a standard dynamic calculation.
     */
    private List<DashboardResponse.WeightPoint> buildWeightProgression(User user) {
        List<DashboardResponse.WeightPoint> points = new ArrayList<>();
        // Generic estimated weekly change (0.5kg/week is standard for both bulk/cut estimations)
        double dailyChangeRate = 0.5 / 7.0;
        double currentWeight = user.getCurrentWeightKg();

        // Start weight estimated generically
        double startWeight = currentWeight - (dailyChangeRate * PROGRESSION_DAYS);
        if (startWeight < 30) startWeight = currentWeight * 0.95;

        LocalDate today = LocalDate.now();
        for (int i = PROGRESSION_DAYS - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            double progress = (double) (PROGRESSION_DAYS - 1 - i) / (PROGRESSION_DAYS - 1);
            double weight = startWeight + (currentWeight - startWeight) * progress;
            points.add(DashboardResponse.WeightPoint.builder()
                    .date(date.format(DATE_FMT))
                    .weightKg(Math.round(weight * 10.0) / 10.0)
                    .build());
        }
        return points;
    }
}