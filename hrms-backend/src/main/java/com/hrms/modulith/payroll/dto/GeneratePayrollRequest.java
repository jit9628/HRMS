package com.hrms.modulith.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GeneratePayrollRequest {

    @NotBlank(message = "Payroll month is required (e.g. 'January 2026')")
    private String payrollMonth;

    private int totalWorkingDays = 22;
}
