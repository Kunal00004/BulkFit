package com.bulkfit.controller;

import com.bulkfit.dto.AiCoachRequest;
import com.bulkfit.dto.AiCoachResponse;
import com.bulkfit.dto.MultiFoodScanResponse;
import com.bulkfit.entity.AiPlan;
import com.bulkfit.entity.User;
import com.bulkfit.repository.AiPlanRepository;
import com.bulkfit.service.AiService;
import com.bulkfit.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AiPlanRepository aiPlanRepository;
    private final UserService userService;

    @PostMapping("/scan-food")
    public ResponseEntity<MultiFoodScanResponse> scanFood(@RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(aiService.scanFoodImage(image));
    }

    @PostMapping("/generate-plan")
    public ResponseEntity<AiCoachResponse> generateCoachPlan(@Valid @RequestBody AiCoachRequest request) {
        return ResponseEntity.ok(aiService.generateCoachingPlan(request));
    }

    @GetMapping("/my-plan")
    public ResponseEntity<?> getMySavedPlan() {
        User user = userService.getCurrentUserEntity();
        Optional<AiPlan> savedPlan = aiPlanRepository.findByUser(user);

        if (savedPlan.isPresent()) {
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(savedPlan.get().getPlanJsonData());
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/my-plan")
    @Transactional
    public ResponseEntity<?> deleteMyPlan() {
        User user = userService.getCurrentUserEntity();
        aiPlanRepository.deleteByUser(user);
        return ResponseEntity.ok(Map.of("message", "Plan deleted successfully. You can generate a new one."));
    }
}