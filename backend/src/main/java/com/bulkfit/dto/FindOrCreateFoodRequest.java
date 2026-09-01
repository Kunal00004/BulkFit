package com.bulkfit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FindOrCreateFoodRequest {
    @NotBlank
    private String name;
    @NotNull
    private Double caloriesPer100g;
    @NotNull
    private Double proteinPer100g;
}