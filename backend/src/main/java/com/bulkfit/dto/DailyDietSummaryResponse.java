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
public class DailyDietSummaryResponse {
    private Double caloriesConsumed;
    private Double calorieGoal;
    private Double proteinConsumed;
    private Double proteinGoal;
    private Double surplusOrDeficit; // positive = surplus (good for bulking)
    private boolean goalMet;
    private List<DietLogResponse> logs;
}
