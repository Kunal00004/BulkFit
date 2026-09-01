package com.bulkfit.service;

import com.bulkfit.dto.AiCoachRequest;
import com.bulkfit.dto.AiCoachResponse;
import com.bulkfit.dto.MultiFoodScanResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AiService {

    MultiFoodScanResponse scanFoodImage(MultipartFile image);

    AiCoachResponse generateCoachingPlan(AiCoachRequest request);
}