package com.bulkfit.service;

import com.bulkfit.dto.DailyDietSummaryResponse;
import com.bulkfit.dto.DietLogRequest;
import com.bulkfit.dto.DietLogResponse;

import java.time.LocalDate;
import java.util.List;

public interface DietService {
    DietLogResponse logFood(DietLogRequest request);
    DailyDietSummaryResponse getDailySummary(LocalDate date);
    List<DietLogResponse> getRecentMeals(int limit);
    void deleteDietLog(Long id);
}
