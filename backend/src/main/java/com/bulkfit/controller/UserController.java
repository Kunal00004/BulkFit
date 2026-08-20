package com.bulkfit.controller;

import com.bulkfit.dto.UserResponse;
import com.bulkfit.dto.WeightUpdateRequest;
import com.bulkfit.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PatchMapping("/me/weight")
    public ResponseEntity<UserResponse> updateWeight(@Valid @RequestBody WeightUpdateRequest request) {
        return ResponseEntity.ok(userService.updateWeight(request));
    }
}
