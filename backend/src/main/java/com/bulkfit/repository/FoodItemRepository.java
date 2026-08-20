package com.bulkfit.repository;

import com.bulkfit.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByNameContainingIgnoreCase(String query);
}
