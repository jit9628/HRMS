package com.hrms.modulith.leave;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "leave_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance extends BaseEntity {

    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;

    @Column(name = "casual_used")
    private double casualLeaveUsed;

    @Column(name = "casual_total")
    private double casualLeaveTotal;

    @Column(name = "sick_used")
    private double sickLeaveUsed;

    @Column(name = "sick_total")
    private double sickLeaveTotal;

    @Column(name = "paid_used")
    private double paidLeaveUsed;

    @Column(name = "paid_total")
    private double paidLeaveTotal;

    @Column(name = "maternity_used")
    private double maternityLeaveUsed;

    @Column(name = "maternity_total")
    private double maternityLeaveTotal;
}
