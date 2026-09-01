package com.bulkfit.controller;

import com.bulkfit.dto.FindOrCreateFoodRequest;
import com.bulkfit.dto.FoodItemResponse;
import com.bulkfit.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> search(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(foodService.searchFoodItems(query));
    }

    @PostMapping("/find-or-create")
    public ResponseEntity<FoodItemResponse> findOrCreate(@Valid @RequestBody FindOrCreateFoodRequest request) {
        FoodItemResponse response = foodService.findOrCreateFoodItem(
                request.getName(), request.getCaloriesPer100g(), request.getProteinPer100g());
        return ResponseEntity.ok(response);
    }
}