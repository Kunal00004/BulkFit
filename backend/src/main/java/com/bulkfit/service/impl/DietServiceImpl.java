package com.bulkfit.service.impl;

import com.bulkfit.dto.*;
import com.bulkfit.entity.DietLog;
import com.bulkfit.entity.FoodItem;
import com.bulkfit.entity.User;
import com.bulkfit.exception.BadRequestException;
import com.bulkfit.exception.ResourceNotFoundException;
import com.bulkfit.repository.DietLogRepository;
import com.bulkfit.repository.FoodItemRepository;
import com.bulkfit.service.DietService;
import com.bulkfit.service.NutritionCalculator;
import com.bulkfit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DietServiceImpl implements DietService {

    private final DietLogRepository dietLogRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserService userService;
    private final NutritionCalculator nutritionCalculator;

    @Override
    @Transactional
    public DietLogResponse logFood(DietLogRequest request) {
        User user = userService.getCurrentUserEntity();

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (request.getQuantityGrams() == null || request.getQuantityGrams() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0 grams");
        }

        DietLog log = DietLog.builder()
                .user(user)
                .foodItem(foodItem)
                .quantityGrams(request.getQuantityGrams())
                .mealType(request.getMealType())
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now())
                .build();

        DietLog saved = dietLogRepository.save(log);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true) // Yeh add kiya taaki session open rahe
    public DailyDietSummaryResponse getDailySummary(LocalDate date) {
        User user = userService.getCurrentUserEntity();
        LocalDate targetDate = date != null ? date : LocalDate.now();

        List<DietLog> logs = dietLogRepository.findByUserAndLogDateOrderByIdDesc(user, targetDate);

        double caloriesConsumed = logs.stream().mapToDouble(DietLog::getComputedCalories).sum();
        double proteinConsumed = logs.stream().mapToDouble(DietLog::getComputedProtein).sum();

        double calorieGoal = nutritionCalculator.calculateDailyCalorieGoal(user);
        double proteinGoal = nutritionCalculator.calculateDailyProteinGoalGrams(user);

        return DailyDietSummaryResponse.builder()
                .caloriesConsumed(Math.round(caloriesConsumed * 10.0) / 10.0)
                .calorieGoal(calorieGoal)
                .proteinConsumed(Math.round(proteinConsumed * 10.0) / 10.0)
                .proteinGoal(proteinGoal)
                .surplusOrDeficit(Math.round((caloriesConsumed - calorieGoal) * 10.0) / 10.0)
                .goalMet(caloriesConsumed >= calorieGoal)
                .logs(logs.stream().map(this::toResponse).collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional(readOnly = true) // Yahan bhi zaroori tha
    public List<DietLogResponse> getRecentMeals(int limit) {
        User user = userService.getCurrentUserEntity();
        return dietLogRepository.findTop5ByUserOrderByIdDesc(user).stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDietLog(Long id) {
        User user = userService.getCurrentUserEntity();
        DietLog log = dietLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diet log not found"));
        if (!log.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this log");
        }
        dietLogRepository.delete(log);
    }

    private DietLogResponse toResponse(DietLog log) {
        return DietLogResponse.builder()
                .id(log.getId())
                .foodItem(FoodItemResponse.builder()
                        .id(log.getFoodItem().getId())
                        .name(log.getFoodItem().getName())
                        .caloriesPer100g(log.getFoodItem().getCaloriesPer100g())
                        .proteinPer100g(log.getFoodItem().getProteinPer100g())
                        .build())
                .quantityGrams(log.getQuantityGrams())
                .mealType(log.getMealType())
                .logDate(log.getLogDate())
                .calories(Math.round(log.getComputedCalories() * 10.0) / 10.0)
                .protein(Math.round(log.getComputedProtein() * 10.0) / 10.0)
                .build();
    }
}