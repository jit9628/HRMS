package com.hrms.modulith.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsDto {
    private long presentToday;
    private long lateToday;
    private long onLeaveToday;
    private long absentToday;
    private double averageWorkingHours;
    private double onTimePercentage;
}
