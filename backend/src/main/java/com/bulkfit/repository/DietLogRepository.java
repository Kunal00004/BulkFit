package com.bulkfit.repository;

import com.bulkfit.entity.DietLog;
import com.bulkfit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {
    List<DietLog> findByUserAndLogDateOrderByIdDesc(User user, LocalDate logDate);
    List<DietLog> findByUserOrderByLogDateDesc(User user);
    List<DietLog> findTop5ByUserOrderByIdDesc(User user);
    List<DietLog> findByUserAndLogDateBetween(User user, LocalDate start, LocalDate end);
}
