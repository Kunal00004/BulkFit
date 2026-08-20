package com.bulkfit.service.impl;

import com.bulkfit.dto.FoodItemResponse;
import com.bulkfit.entity.FoodItem;
import com.bulkfit.repository.FoodItemRepository;
import com.bulkfit.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodItemRepository foodItemRepository;

    @Override
    public List<FoodItemResponse> searchFoodItems(String query) {
        List<FoodItem> items = StringUtils.hasText(query)
                ? foodItemRepository.findByNameContainingIgnoreCase(query)
                : foodItemRepository.findAll();
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
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
}
