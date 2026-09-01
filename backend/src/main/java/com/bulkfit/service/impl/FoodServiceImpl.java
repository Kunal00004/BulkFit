package com.bulkfit.service.impl;

import com.bulkfit.dto.FoodItemResponse;
import com.bulkfit.entity.FoodItem;
import com.bulkfit.repository.FoodItemRepository;
import com.bulkfit.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodItemRepository foodItemRepository;

    @Override
    @Transactional(readOnly = true) // Database read operation optimize karne ke liye
    public List<FoodItemResponse> searchFoodItems(String query) {
        List<FoodItem> items = StringUtils.hasText(query)
                ? foodItemRepository.findByNameContainingIgnoreCase(query)
                : foodItemRepository.findAll();
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // Database read operation optimize karne ke liye
    public List<FoodItemResponse> getAllFoodItems() {
        return foodItemRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private FoodItemResponse toResponse(FoodItem item) {
        return FoodItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .caloriesPer100g(item.getCaloriesPer100g())
                .proteinPer100g(item.getProteinPer100g())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public FoodItemResponse findOrCreateFoodItem(String name, Double caloriesPer100g, Double proteinPer100g) {

        List<com.bulkfit.entity.FoodItem> existing = foodItemRepository.findByNameContainingIgnoreCase(name);

        if (!existing.isEmpty()) {
            return toResponse(existing.get(0));
        }

        com.bulkfit.entity.FoodItem newItem = com.bulkfit.entity.FoodItem.builder()
                .name(name)
                .caloriesPer100g(caloriesPer100g)
                .proteinPer100g(proteinPer100g)
                .build();

        return toResponse(foodItemRepository.save(newItem));
    }
}