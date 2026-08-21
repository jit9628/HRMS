package com.hrms.modulith.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PunchStatusDto {
    private boolean isClockedIn;
    private LocalTime clockInTime;
    private LocalTime clockOutTime;
    private long elapsedSeconds;
    private Double workHours;
    private String status;
}
