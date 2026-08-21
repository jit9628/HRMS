package com.hrms.modulith.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAnnouncementRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String author;
    private String category; // Event, Policy, Update, Celebration
    private String priority; // Normal, Urgent
}
