package com.hrms.modulith.organization.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDepartmentRequest {

    /**
     * Optional for COMPANY_ADMIN (automatically injected from authenticated session).
     * Super Admin can explicitly provide any target companyId.
     */
    private String companyId;

    @NotBlank(message = "Department name is required")
    private String name;

    @NotBlank(message = "Department code is required")
    private String code;

    private String headOfDepartment;

    private String color;
}
