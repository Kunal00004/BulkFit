package com.bulkfit.service;

import com.bulkfit.dto.UserResponse;
import com.bulkfit.dto.WeightUpdateRequest;
import com.bulkfit.entity.User;

public interface UserService {
    User getCurrentUserEntity();
    UserResponse getCurrentUser();
    UserResponse updateWeight(WeightUpdateRequest request);
}
