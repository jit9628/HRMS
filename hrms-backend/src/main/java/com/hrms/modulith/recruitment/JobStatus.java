package com.hrms.modulith.recruitment;

public enum JobStatus {
    ACTIVE("Active"),
    CLOSED("Closed"),
    DRAFT("Draft");

    private final String displayName;

    JobStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static JobStatus fromString(String text) {
        for (JobStatus b : JobStatus.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return ACTIVE;
    }
}
