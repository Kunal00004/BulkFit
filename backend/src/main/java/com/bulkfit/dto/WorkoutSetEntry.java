package com.bulkfit.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * Represents a single set/rep pairing submitted from the dynamic
 * "add set row" UI on the Workout Logger page.
 */
@Data
public class WorkoutSetEntry {

    @Positive(message = "Reps must be greater than 0")
    private Integer reps;
}
