package com.hrms.modulith.leave;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "holiday_date", nullable = false)
    private LocalDate date;

    @Column(name = "day_of_week")
    private String day;

    @Column(name = "type")
    private String type; // Public, Optional
}
