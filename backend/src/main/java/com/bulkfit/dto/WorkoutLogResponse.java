package com.bulkfit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutLogResponse {
    private Long id;
    private ExerciseResponse exercise;
    private Integer sets;
    private Integer reps;
    private LocalDate logDate;
}
