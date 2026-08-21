package com.hrms.modulith.leave;

public enum LeaveType {
    CASUAL_LEAVE("Casual Leave"),
    SICK_LEAVE("Sick Leave"),
    PAID_LEAVE("Paid Leave"),
    MATERNITY_PATERNITY("Maternity / Paternity"),
    BEREAVEMENT("Bereavement");

    private final String displayName;

    LeaveType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static LeaveType fromString(String text) {
        for (LeaveType b : LeaveType.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return PAID_LEAVE;
    }
}
