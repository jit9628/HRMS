package com.hrms.modulith.iam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PermissionAssignmentRequest {
    @NotBlank
    private String featureCode;
    @NotBlank
    private String permissionCode;
}