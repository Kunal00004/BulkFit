package com.bulkfit.service;

import com.bulkfit.dto.WorkoutLogRequest;
import com.bulkfit.dto.WorkoutLogResponse;

import java.util.List;

public interface WorkoutService {
    WorkoutLogResponse logWorkout(WorkoutLogRequest request);
    List<WorkoutLogResponse> logWorkoutBatch(List<WorkoutLogRequest> requests);
    List<WorkoutLogResponse> getRecentWorkouts(int limit);
    void deleteWorkoutLog(Long id);
}
