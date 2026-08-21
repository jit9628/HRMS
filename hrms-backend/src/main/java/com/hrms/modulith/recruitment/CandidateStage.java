package com.hrms.modulith.recruitment;

public enum CandidateStage {
    APPLIED("Applied"),
    SCREENING("Screening"),
    INTERVIEW("Interview"),
    OFFERED("Offered"),
    HIRED("Hired"),
    REJECTED("Rejected");

    private final String displayName;

    CandidateStage(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static CandidateStage fromString(String text) {
        for (CandidateStage b : CandidateStage.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return APPLIED;
    }
}
