package com.hrms.modulith.recruitment;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.recruitment.dto.*;
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
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
@Tag(name = "Recruitment & ATS", description = "Endpoints for job postings, candidate pipelines, and hiring workflows")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @GetMapping("/jobs")
    @Operation(summary = "Get list of all job postings")
    public ResponseEntity<ApiResponse<List<JobPostingDto>>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department
    ) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getAllJobs(status, department)));
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<ApiResponse<JobPostingDto>> getJobById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getJobById(id)));
    }

    @PostMapping("/jobs")
    @Operation(summary = "Create a new job posting")
    public ResponseEntity<ApiResponse<JobPostingDto>> createJob(@Valid @RequestBody CreateJobRequest request) {
        JobPostingDto job = recruitmentService.createJob(request);
        return new ResponseEntity<>(ApiResponse.ok("Job posting created", job), HttpStatus.CREATED);
    }

    @GetMapping("/candidates")
    @Operation(summary = "Get applicants / candidates in hiring pipeline")
    public ResponseEntity<ApiResponse<List<CandidateDto>>> getCandidates(
            @RequestParam(required = false) String jobId,
            @RequestParam(required = false) String stage
    ) {
        return ResponseEntity.ok(ApiResponse.ok(recruitmentService.getCandidates(jobId, stage)));
    }

    @PostMapping("/candidates")
    @Operation(summary = "Submit a candidate application")
    public ResponseEntity<ApiResponse<CandidateDto>> createCandidate(@Valid @RequestBody CreateCandidateRequest request) {
        CandidateDto candidate = recruitmentService.createCandidate(request);
        return new ResponseEntity<>(ApiResponse.ok("Candidate added to pipeline", candidate), HttpStatus.CREATED);
    }

    @PatchMapping("/candidates/{id}/stage")
    @Operation(summary = "Advance or move candidate stage in the pipeline (Triggers Onboarding if Hired)")
    public ResponseEntity<ApiResponse<CandidateDto>> updateStage(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String stage = payload.get("stage");
        CandidateDto candidate = recruitmentService.updateStage(id, stage);
        return ResponseEntity.ok(ApiResponse.ok("Candidate stage updated", candidate));
    }
}
