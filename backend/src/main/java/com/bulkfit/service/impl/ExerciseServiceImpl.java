package com.bulkfit.service.impl;

import com.bulkfit.dto.ExerciseResponse;
import com.bulkfit.entity.Exercise;
import com.bulkfit.repository.ExerciseRepository;
import com.bulkfit.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Override
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ExerciseResponse toResponse(Exercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .targetMuscle(exercise.getTargetMuscle())
                .difficultyLevel(exercise.getDifficultyLevel())
                .build();
    }
}
