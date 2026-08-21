package com.hrms.modulith.employee;

public enum EmploymentType {
    FULL_TIME("Full-Time"),
    PART_TIME("Part-Time"),
    CONTRACT("Contract"),
    INTERN("Intern");

    private final String displayName;

    EmploymentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static EmploymentType fromString(String text) {
        for (EmploymentType b : EmploymentType.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return FULL_TIME;
    }
}
