package com.hrms.modulith.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDto {
    private String id;
    private String name;
    private LocalDate date;
    private String day;
    private String type;
}
