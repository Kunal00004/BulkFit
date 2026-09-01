package com.bulkfit.config;

import com.bulkfit.entity.Exercise;
import com.bulkfit.entity.FoodItem;
import com.bulkfit.enums.DifficultyLevel;
import com.bulkfit.repository.ExerciseRepository;
import com.bulkfit.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Initializes the database with a foundational set of common food items
 * and standard exercises to ensure the application is ready for use on first boot.
 * Designed for a general fitness tracking audience.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FoodItemRepository foodItemRepository;
    private final ExerciseRepository exerciseRepository;

    @Override
    public void run(String... args) {
        if (foodItemRepository.count() == 0) {
            foodItemRepository.saveAll(List.of(
                    FoodItem.builder().name("Chicken Breast (cooked)").caloriesPer100g(165.0).proteinPer100g(31.0).build(),
                    FoodItem.builder().name("White Rice (cooked)").caloriesPer100g(130.0).proteinPer100g(2.7).build(),
                    FoodItem.builder().name("Whole Eggs").caloriesPer100g(155.0).proteinPer100g(13.0).build(),
                    FoodItem.builder().name("Peanut Butter").caloriesPer100g(588.0).proteinPer100g(25.0).build(),
                    FoodItem.builder().name("Whole Milk").caloriesPer100g(61.0).proteinPer100g(3.2).build(),
                    FoodItem.builder().name("Banana").caloriesPer100g(89.0).proteinPer100g(1.1).build(),
                    FoodItem.builder().name("Oats (dry)").caloriesPer100g(389.0).proteinPer100g(16.9).build(),
                    FoodItem.builder().name("Paneer").caloriesPer100g(265.0).proteinPer100g(18.0).build(),
                    FoodItem.builder().name("Whey Protein Powder").caloriesPer100g(400.0).proteinPer100g(80.0).build(),
                    FoodItem.builder().name("Almonds").caloriesPer100g(579.0).proteinPer100g(21.0).build(),
                    FoodItem.builder().name("Sweet Potato (cooked)").caloriesPer100g(90.0).proteinPer100g(2.0).build(),
                    FoodItem.builder().name("Greek Yogurt (full fat)").caloriesPer100g(97.0).proteinPer100g(9.0).build(),
                    FoodItem.builder().name("Salmon (cooked)").caloriesPer100g(208.0).proteinPer100g(20.0).build(),
                    FoodItem.builder().name("Avocado").caloriesPer100g(160.0).proteinPer100g(2.0).build(),
                    FoodItem.builder().name("Lentils (cooked, dal)").caloriesPer100g(116.0).proteinPer100g(9.0).build(),
                    FoodItem.builder().name("Olive Oil").caloriesPer100g(884.0).proteinPer100g(0.0).build()
            ));
        }

        if (exerciseRepository.count() == 0) {
            exerciseRepository.saveAll(List.of(
                    Exercise.builder().name("Push-Ups").targetMuscle("Chest").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Diamond Push-Ups").targetMuscle("Triceps").difficultyLevel(DifficultyLevel.INTERMEDIATE).build(),
                    Exercise.builder().name("Pike Push-Ups").targetMuscle("Shoulders").difficultyLevel(DifficultyLevel.INTERMEDIATE).build(),
                    Exercise.builder().name("Bodyweight Squats").targetMuscle("Quads").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Bulgarian Split Squats").targetMuscle("Quads / Glutes").difficultyLevel(DifficultyLevel.INTERMEDIATE).build(),
                    Exercise.builder().name("Pull-Ups").targetMuscle("Back").difficultyLevel(DifficultyLevel.ADVANCED).build(),
                    Exercise.builder().name("Inverted Rows (table/bar)").targetMuscle("Back").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Plank").targetMuscle("Core").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Hanging Leg Raises").targetMuscle("Core").difficultyLevel(DifficultyLevel.ADVANCED).build(),
                    Exercise.builder().name("Glute Bridges").targetMuscle("Glutes / Hamstrings").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Nordic Curls (assisted)").targetMuscle("Hamstrings").difficultyLevel(DifficultyLevel.ADVANCED).build(),
                    Exercise.builder().name("Chair Dips").targetMuscle("Triceps").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Backpack Loaded Squats").targetMuscle("Quads / Glutes").difficultyLevel(DifficultyLevel.INTERMEDIATE).build(),
                    Exercise.builder().name("Superman Hold").targetMuscle("Lower Back").difficultyLevel(DifficultyLevel.BEGINNER).build(),
                    Exercise.builder().name("Wall Handstand Hold").targetMuscle("Shoulders").difficultyLevel(DifficultyLevel.ADVANCED).build()
            ));
        }
    }
}