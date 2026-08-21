package com.hrms.modulith.iam;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "role_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoleDefinition extends BaseEntity {
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    private String description;
}