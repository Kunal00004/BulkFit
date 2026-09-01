package com.bulkfit.service.impl;

import com.bulkfit.dto.AiCoachRequest;
import com.bulkfit.dto.AiCoachResponse;
import com.bulkfit.dto.DetectedItem;
import com.bulkfit.dto.MultiFoodScanResponse;
import com.bulkfit.entity.AiPlan; // 🔥 Naya Import
import com.bulkfit.entity.User;
import com.bulkfit.exception.AiServiceException;
import com.bulkfit.exception.BadRequestException;
import com.bulkfit.repository.AiPlanRepository;
import com.bulkfit.service.AiService;
import com.bulkfit.service.NutritionCalculator;
import com.bulkfit.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private static final Pattern JSON_BLOCK_PATTERN = Pattern.compile("\\{[\\s\\S]*\\}");

    private final UserService userService;
    private final NutritionCalculator nutritionCalculator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AiPlanRepository aiPlanRepository;

    @Value("${bulkfit.ai.groq.apiKey}")
    private String groqApiKey;

    @Value("${bulkfit.ai.openrouter.apiKey}")
    private String openRouterApiKey;

    @Override
    public MultiFoodScanResponse scanFoodImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Please upload an image of the food");
        }

        String base64Image;
        String mimeType = "image/jpeg";
        try {
            base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded image");
        }

        String prompt = """
                You are an advanced nutrition vision assistant for a fitness app called BulkFit.
                Analyze this food photo and identify ALL distinct food items or ingredients visible.
                For each item, estimate its portion/weight in grams. Provide ACCURATE nutrition facts per 100g.
                DO NOT return 0 for macros unless it's genuinely 0 (like water).
                Respond with ONLY a raw JSON object (no markdown, no extra text) in EXACTLY this shape:
                {
                  "items": [
                    {
                      "foodName": "string",
                      "estimatedWeightGrams": number,
                      "caloriesPer100g": number,
                      "proteinPer100g": number,
                      "carbsPer100g": number,
                      "fatPer100g": number,
                      "confidence": number between 0.0 and 1.0
                    }
                  ],
                  "scanSummaryNote": "short 1 sentence description of the entire meal"
                }
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "google/gemini-3.7-flash",
                "max_tokens", 1500,
                "messages", List.of(
                        Map.of("role", "user",
                                "content", List.of(
                                        Map.of("type", "text", "text", prompt),
                                        Map.of("type", "image_url", "image_url", Map.of("url", "data:" + mimeType + ";base64," + base64Image))
                                )
                        )
                )
        );

        String rawText = callOpenRouterForVision(requestBody);
        JsonNode json = extractJson(rawText);

        List<DetectedItem> detectedItems = new ArrayList<>();
        if (json.has("items") && json.get("items").isArray()) {
            for (JsonNode itemNode : json.get("items")) {
                detectedItems.add(DetectedItem.builder()
                        .foodName(textOrDefault(itemNode, "foodName", "Unknown Food"))
                        .estimatedWeightGrams(numberOrDefault(itemNode, "estimatedWeightGrams", 100.0))
                        .caloriesPer100g(numberOrDefault(itemNode, "caloriesPer100g", 0.0))
                        .proteinPer100g(numberOrDefault(itemNode, "proteinPer100g", 0.0))
                        .carbsPer100g(numberOrDefault(itemNode, "carbsPer100g", 0.0))
                        .fatPer100g(numberOrDefault(itemNode, "fatPer100g", 0.0))
                        .confidence(numberOrDefault(itemNode, "confidence", 0.9))
                        .build());
            }
        }

        return MultiFoodScanResponse.builder()
                .items(detectedItems)
                .scanSummaryNote(textOrDefault(json, "scanSummaryNote", "Meal analyzed successfully."))
                .build();
    }

    @Override
    @Transactional
    public AiCoachResponse generateCoachingPlan(AiCoachRequest request) {
        User user = userService.getCurrentUserEntity();
        double calorieGoal = nutritionCalculator.calculateDailyCalorieGoal(user);
        double proteinGoal = nutritionCalculator.calculateDailyProteinGoalGrams(user);

        String prompt = String.format("""
                CRITICAL INSTRUCTION: Return ONLY a valid JSON object. No markdown, no extra text.
                
                Act as an expert fitness coach for BulkFit, helping underweight users gain muscle mass.

                Client profile:
                - Weight: %.1f kg | Height: %.1f cm | Age: %d
                - Goal: %s | Diet: %s | Workout Style: %s
                - Daily Target: %.0f kcal | %.0f g protein

                Create a 7-day workout routine and meal plan in EXACTLY this JSON shape:
                {
                  "summary": "2 sentence coach intro",
                  "dailyCalorieTarget": number,
                  "dailyProteinTargetGrams": number,
                  "weeklyWorkoutPlan": [
                    { "day": "Monday", "focus": "string", "exercises": ["string"], "restDay": boolean }
                  ],
                  "weeklyMealPlan": [
                    { "day": "Monday", "meals": [ { "mealType": "Breakfast", "description": "string", "estimatedCalories": number } ] }
                  ]
                }
                Must contain exactly 7 entries per array. Keep meal descriptions short.
                """,
                user.getCurrentWeightKg(), user.getHeightCm(), user.getAge(),
                request.getGoal(), request.getDietPreference(), request.getWorkoutStyle(),
                calorieGoal, proteinGoal
        );

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-20b",
                "max_tokens", 2500,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a helpful AI fitness coach. Output ONLY valid JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7
        );

        // 1. Groq API call
        String rawText = callGroqApi(requestBody);

        AiPlan existingPlan = aiPlanRepository.findByUser(user).orElse(new AiPlan());
        existingPlan.setUser(user);
        existingPlan.setPlanJsonData(rawText);
        aiPlanRepository.save(existingPlan);

        return parseCoachResponse(rawText, calorieGoal, proteinGoal);
    }

    private String callGroqApi(Map<String, Object> requestBody) {
        try {
            WebClient freshClient = WebClient.builder()
                    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                    .build();

            JsonNode response = freshClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null) {
                throw new AiServiceException("AI returned an empty response");
            }

            JsonNode textNode = response.path("choices").path(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new AiServiceException("AI did not return a usable result.");
            }
            return textNode.asText();

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            System.err.println("\n❌ GROQ API REJECTED THE REQUEST: " + e.getResponseBodyAsString() + "\n");
            throw new AiServiceException("Groq Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new AiServiceException("Failed to reach the AI service for text coaching.", e);
        }
    }

    private String callOpenRouterForVision(Map<String, Object> requestBody) {
        try {
            WebClient freshClient = WebClient.builder()
                    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                    .build();

            JsonNode response = freshClient.post()
                    .uri("https://openrouter.ai/api/v1/chat/completions")
                    .header("Authorization", "Bearer " + openRouterApiKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:5173")
                    .header("X-Title", "BulkFit Coach")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null) {
                throw new AiServiceException("AI returned an empty response");
            }

            JsonNode textNode = response.path("choices").path(0).path("message").path("content");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new AiServiceException("AI did not return a usable result.");
            }
            return textNode.asText();

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            System.err.println("\n❌ OPENROUTER VISION REJECTED THE REQUEST!");
            System.err.println("Exact Error from OpenRouter: " + e.getResponseBodyAsString() + "\n");
            throw new AiServiceException("OpenRouter Vision Error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("OpenRouter Vision API call failed", e);
            throw new AiServiceException("Failed to reach the Vision AI service for image scanning.", e);
        }
    }

    private JsonNode extractJson(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            throw new AiServiceException("AI returned empty text.");
        }

        String cleanedText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

        try {
            return objectMapper.readTree(cleanedText);
        } catch (Exception firstAttemptFailed) {
            Matcher matcher = JSON_BLOCK_PATTERN.matcher(cleanedText);
            if (matcher.find()) {
                try {
                    return objectMapper.readTree(matcher.group());
                } catch (Exception e) {
                    throw new AiServiceException("AI response could not be parsed.", e);
                }
            }
            throw new AiServiceException("AI response could not be parsed.", firstAttemptFailed);
        }
    }

    private AiCoachResponse parseCoachResponse(String rawText, double fallbackCalories, double fallbackProtein) {
        JsonNode json = extractJson(rawText);
        try {
            AiCoachResponse.AiCoachResponseBuilder builder = AiCoachResponse.builder()
                    .summary(textOrDefault(json, "summary", "Here is your personalized plan."))
                    .dailyCalorieTarget(numberOrDefault(json, "dailyCalorieTarget", fallbackCalories))
                    .dailyProteinTargetGrams(numberOrDefault(json, "dailyProteinTargetGrams", fallbackProtein));

            List<AiCoachResponse.WorkoutDay> workoutDays = objectMapper.convertValue(
                    json.path("weeklyWorkoutPlan"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, AiCoachResponse.WorkoutDay.class)
            );
            List<AiCoachResponse.MealDay> mealDays = objectMapper.convertValue(
                    json.path("weeklyMealPlan"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, AiCoachResponse.MealDay.class)
            );

            builder.weeklyWorkoutPlan(workoutDays != null ? workoutDays : List.of());
            builder.weeklyMealPlan(mealDays != null ? mealDays : List.of());

            return builder.build();
        } catch (Exception e) {
            log.error("Failed to map API response: {}", rawText, e);
            throw new AiServiceException("AI returned an unexpected plan format.", e);
        }
    }

    private String textOrDefault(JsonNode node, String field, String defaultValue) {
        JsonNode value = node.get(field);
        return (value != null && !value.isNull()) ? value.asText() : defaultValue;
    }

    private Double numberOrDefault(JsonNode node, String field, Double defaultValue) {
        JsonNode value = node.get(field);
        return (value != null && value.isNumber()) ? value.asDouble() : defaultValue;
    }
}