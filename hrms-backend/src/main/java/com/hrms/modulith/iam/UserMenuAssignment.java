package com.hrms.modulith.iam;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "user_menu_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMenuAssignment extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "feature_code", nullable = false)
    private String featureCode;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}