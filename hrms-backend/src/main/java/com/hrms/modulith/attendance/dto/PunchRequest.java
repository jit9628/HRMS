package com.hrms.modulith.attendance.dto;

import lombok.Data;

@Data
public class PunchRequest {
    private String employeeId;
    private String employeeName;
    private String notes;
    private String location;
}
