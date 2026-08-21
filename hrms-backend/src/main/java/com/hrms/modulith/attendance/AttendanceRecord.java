package com.hrms.modulith.attendance;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "record_date", nullable = false)
    private LocalDate date;

    @Column(name = "clock_in")
    private LocalTime clockIn;

    @Column(name = "clock_out")
    private LocalTime clockOut;

    @Column(name = "work_hours")
    private Double workHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "is_overtime")
    private boolean isOvertime;
}
