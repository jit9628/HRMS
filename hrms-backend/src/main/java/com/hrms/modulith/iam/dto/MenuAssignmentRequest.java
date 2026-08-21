package com.hrms.modulith.iam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MenuAssignmentRequest {

    @NotBlank
    private String featureCode;
}