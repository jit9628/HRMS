package com.hrms.modulith.iam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFeaturesResponse {

    private String userId;
    private String name;
    private String email;
    private String role;
    private String designation;
    private String department;
    private String companyId;
    private String companyName;
    private List<UserFeatureDto> features;
}
