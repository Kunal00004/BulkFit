package com.bulkfit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkoutLogRequest {

    @NotNull(message = "Exercise is required")
    private Long exerciseId;

    @Positive(message = "Sets must be greater than 0")
    private Integer sets;

    @Positive(message = "Reps must be greater than 0")
    private Integer reps;

    private LocalDate logDate;
}
