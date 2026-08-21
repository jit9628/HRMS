package com.hrms.modulith.performance;

public enum GoalStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    DELAYED("Delayed");

    private final String displayName;

    GoalStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static GoalStatus fromString(String text) {
        for (GoalStatus b : GoalStatus.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return NOT_STARTED;
    }
}
