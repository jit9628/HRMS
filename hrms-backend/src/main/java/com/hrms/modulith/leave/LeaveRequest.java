package com.hrms.modulith.leave;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "department")
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveType leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false)
    private double totalDays;

    @Column(name = "reason", length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeaveStatus status;

    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;

    @Column(name = "approver_comments")
    private String approverComments;
}
