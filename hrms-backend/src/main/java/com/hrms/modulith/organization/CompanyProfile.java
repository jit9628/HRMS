package com.hrms.modulith.organization;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "industry")
    private String industry;

    @Column(name = "company_type")
    private String type; // Headquarters, Subsidiary, Regional Branch, Sister Entity

    @Column(name = "status")
    private String status; // Active, Under Review, Inactive

    @Column(name = "website")
    private String website;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "country")
    private String country;

    @Column(name = "currency")
    private String currency;

    @Column(name = "time_zone")
    private String timeZone;

    @Column(name = "total_employees")
    private int totalEmployees;

    @Column(name = "total_departments")
    private int totalDepartments;

    @Column(name = "is_default")
    private boolean isDefault;

    @Column(name = "brand_color")
    private String brandColor;

    @Column(name = "established_date")
    private String establishedDate;
}
