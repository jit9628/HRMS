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
public class UserDto {

    private String id;
    private String name;
    private String email;
    private String role;
    private List<String> roles;
    private String designation;
    private String department;
    private String avatarInitials;
    private String companyId;
    private String companyName;
    private String employeeId;
}
