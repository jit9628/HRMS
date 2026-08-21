package com.hrms.modulith.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDto {
    private String id;
    private String title;
    private String content;
    private LocalDate date;
    private String author;
    private String category;
    private String priority;
}
