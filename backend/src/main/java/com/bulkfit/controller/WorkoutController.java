package com.bulkfit.controller;

import com.bulkfit.dto.WorkoutLogRequest;
import com.bulkfit.dto.WorkoutLogResponse;
import com.bulkfit.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping("/logs")
    public ResponseEntity<WorkoutLogResponse> logWorkout(@Valid @RequestBody WorkoutLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.logWorkout(request));
    }

    /** Supports the dynamic multi-set-row form: submit a batch of set/rep rows in one call. */
    @PostMapping("/logs/batch")
    public ResponseEntity<List<WorkoutLogResponse>> logWorkoutBatch(
            @Valid @RequestBody List<WorkoutLogRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.logWorkoutBatch(requests));
    }

    @GetMapping("/logs/recent")
    public ResponseEntity<List<WorkoutLogResponse>> getRecent(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(workoutService.getRecentWorkouts(limit));
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        workoutService.deleteWorkoutLog(id);
        return ResponseEntity.noContent().build();
    }
}
