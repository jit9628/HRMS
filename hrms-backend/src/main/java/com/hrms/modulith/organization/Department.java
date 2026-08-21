package com.hrms.modulith.organization;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseEntity {

    @Column(name = "company_id", nullable = false)
    private String companyId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "head_of_department")
    private String headOfDepartment;

    @Column(name = "total_employees")
    private int totalEmployees;

    @Column(name = "color")
    private String color;
}
