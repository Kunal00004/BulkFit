package com.bulkfit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemResponse {
    private Long id;
    private String name;
    private Double caloriesPer100g;
    private Double proteinPer100g;
}
