package com.hrms.modulith.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalTime clockIn;
    private LocalTime clockOut;
    private Double workHours;
    private String status;
    private String notes;
    private boolean isOvertime;
}
