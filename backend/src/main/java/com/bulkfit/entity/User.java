package com.bulkfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter // Sirf Getter/Setter use karo, @Data HATA DO
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private int age;

    // Added: Gender (M/F) aur Activity Level BMR calculations ke liye zaroori hain
    @Column(nullable = false, length = 10)
    private String gender;

    @Column(name = "activity_level", nullable = false)
    private String activityLevel;

    @Column(name = "height_cm", nullable = false)
    private Double heightCm;

    @Column(name = "current_weight_kg", nullable = false)
    private Double currentWeightKg;

    @Column(name = "target_weight_kg", nullable = false)
    private Double targetWeightKg;

    // Role ko Enum banana chahiye tha, par abhi String hai toh DB length restrict karo
    @Column(nullable = false, length = 20)
    private String role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = "ROLE_USER"; // Spring Security standard "ROLE_" prefix mangta hai
        }
    }
}