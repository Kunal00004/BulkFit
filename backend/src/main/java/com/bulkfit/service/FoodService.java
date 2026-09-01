package com.bulkfit.service;

import com.bulkfit.dto.FoodItemResponse;

import java.util.List;

public interface FoodService {
    List<FoodItemResponse> searchFoodItems(String query);
    List<FoodItemResponse> getAllFoodItems();
    FoodItemResponse findOrCreateFoodItem(String name, Double caloriesPer100g, Double proteinPer100g);
}
