package com.bulkfit.dto;

import com.bulkfit.enums.MealType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DietLogRequest {

    @NotNull(message = "Food item is required")
    private Long foodItemId;

    @Positive(message = "Quantity must be greater than 0")
    private Double quantityGrams;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    // Optional - defaults to today if not provided
    private LocalDate logDate;
}
