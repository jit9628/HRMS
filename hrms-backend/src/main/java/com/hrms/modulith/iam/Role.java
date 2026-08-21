package com.hrms.modulith.iam;

public enum Role {
    SUPER_ADMIN("Super Admin"),
    COMPANY_ADMIN("Company Admin"),
    ADMIN("Admin"),
    HR_MANAGER("HR Manager"),
    EMPLOYEE("Employee");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Role fromString(String text) {
        if (text == null) {
            return EMPLOYEE;
        }
        for (Role b : Role.values()) {
            if (b.name().equalsIgnoreCase(text.trim()) || b.displayName.equalsIgnoreCase(text.trim())) {
                return b;
            }
        }
        return EMPLOYEE;
    }
}
