package com.bulkfit.controller;

import com.bulkfit.dto.DailyDietSummaryResponse;
import com.bulkfit.dto.DietLogRequest;
import com.bulkfit.dto.DietLogResponse;
import com.bulkfit.service.DietService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;

    @PostMapping("/logs")
    public ResponseEntity<DietLogResponse> logFood(@Valid @RequestBody DietLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dietService.logFood(request));
    }

    @GetMapping("/summary")
    public ResponseEntity<DailyDietSummaryResponse> getDailySummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(dietService.getDailySummary(date));
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        dietService.deleteDietLog(id);
        return ResponseEntity.noContent().build();
    }
}
