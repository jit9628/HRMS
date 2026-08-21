package com.hrms.modulith.attendance;

public enum AttendanceStatus {
    PRESENT("Present"),
    LATE("Late"),
    HALF_DAY("Half Day"),
    ABSENT("Absent"),
    ON_LEAVE("On Leave"),
    HOLIDAY("Holiday");

    private final String displayName;

    AttendanceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static AttendanceStatus fromString(String text) {
        for (AttendanceStatus b : AttendanceStatus.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return PRESENT;
    }
}
