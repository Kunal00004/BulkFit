package com.bulkfit.dto;

import com.bulkfit.enums.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DietLogResponse {
    private Long id;
    private FoodItemResponse foodItem;
    private Double quantityGrams;
    private MealType mealType;
    private LocalDate logDate;
    private Double calories;
    private Double protein;
}
