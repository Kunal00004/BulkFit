package com.bulkfit.repository;

import com.bulkfit.entity.User;
import com.bulkfit.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserAndLogDateOrderByIdDesc(User user, LocalDate logDate);
    List<WorkoutLog> findTop5ByUserOrderByIdDesc(User user);
    List<WorkoutLog> findByUserOrderByLogDateDesc(User user);
}
