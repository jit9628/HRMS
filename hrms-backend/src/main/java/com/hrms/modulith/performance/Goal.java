package com.hrms.modulith.performance;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "performance_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "category")
    private String category; // Strategic, Operational, Learning, Leadership

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private GoalPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GoalStatus status;

    @Column(name = "progress_percent")
    private int progressPercent;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_by")
    private String assignedBy;
}
