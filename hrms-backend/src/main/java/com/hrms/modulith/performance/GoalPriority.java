package com.hrms.modulith.performance;

public enum GoalPriority {
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    private final String displayName;

    GoalPriority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static GoalPriority fromString(String text) {
        for (GoalPriority b : GoalPriority.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return MEDIUM;
    }
}
