package com.hrms.modulith.organization;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "designations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designation extends BaseEntity {

    @Column(name = "company_id")
    private String companyId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "level")
    private String level;
}
