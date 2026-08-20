package com.bulkfit.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class WeightUpdateRequest {

    @Positive(message = "Weight must be positive")
    private Double currentWeightKg;
}
