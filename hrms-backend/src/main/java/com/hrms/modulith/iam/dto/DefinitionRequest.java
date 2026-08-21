package com.hrms.modulith.iam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DefinitionRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private String description;
}