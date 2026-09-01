package com.bulkfit.repository;

import com.bulkfit.entity.AiPlan;
import com.bulkfit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiPlanRepository extends JpaRepository<AiPlan, Long> {
    Optional<AiPlan> findByUser(User user);
    void deleteByUser(User user);
}