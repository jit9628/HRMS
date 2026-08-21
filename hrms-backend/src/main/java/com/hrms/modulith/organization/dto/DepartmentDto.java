package com.hrms.modulith.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private String id;
    private String companyId;
    private String name;
    private String code;
    private String headOfDepartment;
    private int totalEmployees;
    private String color;
}
