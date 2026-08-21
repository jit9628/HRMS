package com.hrms.modulith.performance;

import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.performance.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final GoalRepository goalRepository;
    private final AppraisalReviewRepository reviewRepository;

    // Goals
    @Transactional(readOnly = true)
    public List<GoalDto> getGoals(String employeeId) {
        List<Goal> list = employeeId != null
                ? goalRepository.findByEmployeeId(employeeId)
                : goalRepository.findAll();
        return list.stream().map(this::mapGoalToDto).collect(Collectors.toList());
    }

    @Transactional
    public GoalDto createGoal(CreateGoalRequest req) {
        Goal goal = Goal.builder()
                .employeeId(req.getEmployeeId())
                .employeeName(req.getEmployeeName())
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory() != null ? req.getCategory() : "Operational")
                .priority(req.getPriority() != null ? GoalPriority.fromString(req.getPriority()) : GoalPriority.MEDIUM)
                .status(GoalStatus.NOT_STARTED)
                .progressPercent(0)
                .dueDate(req.getDueDate())
                .assignedBy(req.getAssignedBy() != null ? req.getAssignedBy() : "Manager")
                .build();

        goal = goalRepository.save(goal);
        return mapGoalToDto(goal);
    }

    @Transactional
    public GoalDto updateGoalProgress(String id, int progress) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));

        goal.setProgressPercent(progress);
        if (progress >= 100) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else if (progress > 0) {
            goal.setStatus(GoalStatus.IN_PROGRESS);
        }
        goal = goalRepository.save(goal);
        return mapGoalToDto(goal);
    }

    // Reviews
    @Transactional(readOnly = true)
    public List<AppraisalReviewDto> getReviews(String employeeId, String cycle) {
        List<AppraisalReview> list;
        if (employeeId != null) {
            list = reviewRepository.findByEmployeeId(employeeId);
        } else if (cycle != null) {
            list = reviewRepository.findByReviewCycle(cycle);
        } else {
            list = reviewRepository.findAll();
        }

        return list.stream().map(this::mapReviewToDto).collect(Collectors.toList());
    }

    @Transactional
    public AppraisalReviewDto createReview(CreateReviewRequest req) {
        double overall = (req.getTechnicalScore() + req.getCommunicationScore() + req.getLeadershipScore()) / 3.0;
        overall = Math.round(overall * 10.0) / 10.0;

        AppraisalReview review = AppraisalReview.builder()
                .employeeId(req.getEmployeeId())
                .employeeName(req.getEmployeeName())
                .department(req.getDepartment())
                .reviewCycle(req.getReviewCycle())
                .reviewerName(req.getReviewerName())
                .technicalScore(req.getTechnicalScore())
                .communicationScore(req.getCommunicationScore())
                .leadershipScore(req.getLeadershipScore())
                .overallRating(overall)
                .feedback(req.getFeedback())
                .status("Submitted")
                .build();

        review = reviewRepository.save(review);
        return mapReviewToDto(review);
    }

    private GoalDto mapGoalToDto(Goal g) {
        return GoalDto.builder()
                .id(g.getId())
                .employeeId(g.getEmployeeId())
                .employeeName(g.getEmployeeName())
                .title(g.getTitle())
                .description(g.getDescription())
                .category(g.getCategory())
                .priority(g.getPriority().getDisplayName())
                .status(g.getStatus().getDisplayName())
                .progressPercent(g.getProgressPercent())
                .dueDate(g.getDueDate())
                .assignedBy(g.getAssignedBy())
                .build();
    }

    private AppraisalReviewDto mapReviewToDto(AppraisalReview r) {
        return AppraisalReviewDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployeeId())
                .employeeName(r.getEmployeeName())
                .department(r.getDepartment())
                .reviewCycle(r.getReviewCycle())
                .reviewerName(r.getReviewerName())
                .technicalScore(r.getTechnicalScore())
                .communicationScore(r.getCommunicationScore())
                .leadershipScore(r.getLeadershipScore())
                .overallRating(r.getOverallRating())
                .feedback(r.getFeedback())
                .status(r.getStatus())
                .build();
    }
}
