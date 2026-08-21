package com.hrms.modulith.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignationDto {
    private String id;
    private String companyId;
    private String title;
    private String department;
    private String level;
}
