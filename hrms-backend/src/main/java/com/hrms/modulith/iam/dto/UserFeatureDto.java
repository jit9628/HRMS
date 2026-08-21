package com.hrms.modulith.iam.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserFeatureDto {

    private String id;
    private String code;
    private String title;
    private String path;
    private String icon;
    private String category;
    private int orderIndex;
    private Integer badge;
    @Builder.Default
    private boolean enabled = true;
    private List<String> permissions;
    private List<UserFeatureDto> children;
}
