package com.hrms.modulith.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDto {
    private String employeeId;
    private BalanceItem casualLeave;
    private BalanceItem sickLeave;
    private BalanceItem paidLeave;
    private BalanceItem maternityLeave;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceItem {
        private double used;
        private double total;
    }
}
