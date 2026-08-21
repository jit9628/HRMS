package com.hrms.modulith.performance;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "appraisal_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppraisalReview extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "department")
    private String department;

    @Column(name = "review_cycle", nullable = false)
    private String reviewCycle; // e.g. "2025 Annual Review", "Q1 2026 Review"

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "technical_score")
    private double technicalScore; // 1-5

    @Column(name = "communication_score")
    private double communicationScore; // 1-5

    @Column(name = "leadership_score")
    private double leadershipScore; // 1-5

    @Column(name = "overall_rating")
    private double overallRating; // 1-5

    @Column(name = "feedback", length = 2000)
    private String feedback;

    @Column(name = "status")
    private String status; // Draft, Submitted, Acknowledged
}
