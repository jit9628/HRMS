package com.hrms.modulith.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private String id;
    private String code;
    private String companyName;
    private String tagline;
    private String industry;
    private String type;
    private String status;
    private String website;
    private String taxId;
    private String registrationNumber;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String currency;
    private String timeZone;
    private int totalEmployees;
    private int totalDepartments;
    private boolean isDefault;
    private String brandColor;
    private String establishedDate;
}
