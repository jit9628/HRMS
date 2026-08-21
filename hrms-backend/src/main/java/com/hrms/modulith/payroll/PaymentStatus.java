package com.hrms.modulith.payroll;

public enum PaymentStatus {
    PENDING("Pending"),
    PROCESSING("Processing"),
    PAID("Paid");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PaymentStatus fromString(String text) {
        for (PaymentStatus b : PaymentStatus.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return PENDING;
    }
}
