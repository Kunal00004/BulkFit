package com.bulkfit.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FoodScanResponse {
    private String foodName;
    private Double caloriesPer100g;
    private Double proteinPer100g;
    private Double confidence;
    private String note;
}