package com.bulkfit.service.impl;

import com.bulkfit.dto.ExerciseResponse;
import com.bulkfit.dto.WorkoutLogRequest;
import com.bulkfit.dto.WorkoutLogResponse;
import com.bulkfit.entity.Exercise;
import com.bulkfit.entity.User;
import com.bulkfit.entity.WorkoutLog;
import com.bulkfit.exception.BadRequestException;
import com.bulkfit.exception.ResourceNotFoundException;
import com.bulkfit.repository.ExerciseRepository;
import com.bulkfit.repository.WorkoutLogRepository;
import com.bulkfit.service.UserService;
import com.bulkfit.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    @Override
    @Transactional
    public WorkoutLogResponse logWorkout(WorkoutLogRequest request) {
        User user = userService.getCurrentUserEntity();

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        WorkoutLog log = WorkoutLog.builder()
                .user(user)
                .exercise(exercise)
                .sets(request.getSets())
                .reps(request.getReps())
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now())
                .build();

        WorkoutLog saved = workoutLogRepository.save(log);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public List<WorkoutLogResponse> logWorkoutBatch(List<WorkoutLogRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new BadRequestException("At least one set entry is required");
        }
        return requests.stream().map(this::logWorkout).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // Yeh zaroori tha lazily load karne ke liye!
    public List<WorkoutLogResponse> getRecentWorkouts(int limit) {
        User user = userService.getCurrentUserEntity();
        return workoutLogRepository.findTop5ByUserOrderByIdDesc(user).stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteWorkoutLog(Long id) {
        User user = userService.getCurrentUserEntity();
        WorkoutLog log = workoutLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout log not found"));
        if (!log.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this log");
        }
        workoutLogRepository.delete(log);
    }

    private WorkoutLogResponse toResponse(WorkoutLog log) {
        return WorkoutLogResponse.builder()
                .id(log.getId())
                .exercise(ExerciseResponse.builder()
                        .id(log.getExercise().getId())
                        .name(log.getExercise().getName())
                        .targetMuscle(log.getExercise().getTargetMuscle())
                        .difficultyLevel(log.getExercise().getDifficultyLevel())
                        .build())
                .sets(log.getSets())
                .reps(log.getReps())
                .logDate(log.getLogDate())
                .build();
    }
}