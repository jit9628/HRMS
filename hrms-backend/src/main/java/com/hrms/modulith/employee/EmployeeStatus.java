package com.hrms.modulith.employee;

public enum EmployeeStatus {
    ACTIVE("Active"),
    ON_LEAVE("On Leave"),
    TERMINATED("Terminated"),
    PROBATION("Probation");

    private final String displayName;

    EmployeeStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static EmployeeStatus fromString(String text) {
        for (EmployeeStatus b : EmployeeStatus.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return ACTIVE;
    }
}
