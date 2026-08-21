package com.hrms.modulith.iam;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "designation")
    private String designation;

    @Column(name = "department")
    private String department;

    @Column(name = "avatar_initials")
    private String avatarInitials;

    @Column(name = "company_id")
    private String companyId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "employee_id")
    private String employeeId;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;
}
