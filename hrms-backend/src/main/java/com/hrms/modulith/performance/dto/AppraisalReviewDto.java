package com.hrms.modulith.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppraisalReviewDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String department;
    private String reviewCycle;
    private String reviewerName;
    private double technicalScore;
    private double communicationScore;
    private double leadershipScore;
    private double overallRating;
    private String feedback;
    private String status;
}
