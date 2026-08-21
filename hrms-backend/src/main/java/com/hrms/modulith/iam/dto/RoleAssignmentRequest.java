package com.hrms.modulith.iam.dto;

import lombok.Data;
import java.util.List;

@Data
public class RoleAssignmentRequest {
    private List<String> roles;

    public List<String> effectiveRoles() {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles;
    }
}