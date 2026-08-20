package com.bulkfit.entity;

import com.bulkfit.enums.MealType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "diet_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(name = "quantity_grams", nullable = false)
    private Double quantityGrams;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Transient
    public Double getComputedCalories() {
        if (foodItem == null || quantityGrams == null) return 0.0;
        return (foodItem.getCaloriesPer100g() * quantityGrams) / 100.0;
    }

    @Transient
    public Double getComputedProtein() {
        if (foodItem == null || quantityGrams == null) return 0.0;
        return (foodItem.getProteinPer100g() * quantityGrams) / 100.0;
    }
}
