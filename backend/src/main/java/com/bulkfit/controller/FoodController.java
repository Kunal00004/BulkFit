package com.bulkfit.controller;

import com.bulkfit.dto.FoodItemResponse;
import com.bulkfit.service.FoodService;
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
}
