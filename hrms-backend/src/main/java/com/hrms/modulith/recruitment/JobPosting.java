package com.hrms.modulith.recruitment;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "location")
    private String location;

    @Column(name = "employment_type")
    private String type; // Full-Time, Part-Time, Remote, Hybrid

    @Column(name = "openings")
    private int openings;

    @Column(name = "applicants_count")
    private int applicantsCount;

    @Column(name = "experience_range")
    private String experienceRange;

    @Column(name = "salary_range")
    private String salaryRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private JobStatus status;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "description", length = 2000)
    private String description;
}
