package com.hrms.modulith.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContact {
    @Column(name = "emergency_name")
    private String name;

    @Column(name = "emergency_relationship")
    private String relationship;

    @Column(name = "emergency_phone")
    private String phone;
}
