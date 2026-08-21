package com.hrms.modulith.performance;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.performance.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
@Tag(name = "Performance & OKRs", description = "Endpoints for employee goal tracking, appraisal reviews, and feedback")
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/goals")
    @Operation(summary = "Get goals filtered by employee")
    public ResponseEntity<ApiResponse<List<GoalDto>>> getGoals(@RequestParam(required = false) String employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(performanceService.getGoals(employeeId)));
    }

    @PostMapping("/goals")
    @Operation(summary = "Create a new performance goal / OKR")
    public ResponseEntity<ApiResponse<GoalDto>> createGoal(@Valid @RequestBody CreateGoalRequest request) {
        GoalDto goal = performanceService.createGoal(request);
        return new ResponseEntity<>(ApiResponse.ok("Goal created", goal), HttpStatus.CREATED);
    }

    @PatchMapping("/goals/{id}/progress")
    @Operation(summary = "Update progress percentage of a goal")
    public ResponseEntity<ApiResponse<GoalDto>> updateGoalProgress(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload
    ) {
        int progress = payload.getOrDefault("progress", 0);
        GoalDto goal = performanceService.updateGoalProgress(id, progress);
        return ResponseEntity.ok(ApiResponse.ok("Goal progress updated", goal));
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get appraisal reviews by employee or cycle")
    public ResponseEntity<ApiResponse<List<AppraisalReviewDto>>> getReviews(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String reviewCycle
    ) {
        return ResponseEntity.ok(ApiResponse.ok(performanceService.getReviews(employeeId, reviewCycle)));
    }

    @PostMapping("/reviews")
    @Operation(summary = "Submit an appraisal review")
    public ResponseEntity<ApiResponse<AppraisalReviewDto>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        AppraisalReviewDto review = performanceService.createReview(request);
        return new ResponseEntity<>(ApiResponse.ok("Appraisal review submitted", review), HttpStatus.CREATED);
    }
}
