package com.hrms.modulith.leave;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.leave.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Endpoints for leave applications, manager approvals, balance tracking, and holidays")
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/balances/{employeeId}")
    @Operation(summary = "Get leave balance quota for an employee")
    public ResponseEntity<ApiResponse<LeaveBalanceDto>> getLeaveBalance(@PathVariable String employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getLeaveBalance(employeeId)));
    }

    @PostMapping("/apply")
    @Operation(summary = "Submit a new leave application")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(@Valid @RequestBody ApplyLeaveRequest request) {
        LeaveRequestDto result = leaveService.applyLeave(request);
        return new ResponseEntity<>(ApiResponse.ok("Leave applied successfully", result), HttpStatus.CREATED);
    }

    @GetMapping("/requests")
    @Operation(summary = "Get leave requests filtered by employee or status")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getLeaveRequests(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getLeaveRequests(employeeId, status)));
    }

    @PatchMapping("/requests/{id}/approve")
    @Operation(summary = "Manager approval of leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeave(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String comments = payload != null ? payload.get("comments") : "Approved by Manager";
        return ResponseEntity.ok(ApiResponse.ok("Leave request approved", leaveService.approveLeave(id, comments)));
    }

    @PatchMapping("/requests/{id}/reject")
    @Operation(summary = "Manager rejection of leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> rejectLeave(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String comments = payload != null ? payload.get("comments") : "Rejected by Manager";
        return ResponseEntity.ok(ApiResponse.ok("Leave request rejected", leaveService.rejectLeave(id, comments)));
    }

    @GetMapping("/holidays")
    @Operation(summary = "Get list of upcoming company holidays")
    public ResponseEntity<ApiResponse<List<HolidayDto>>> getHolidays(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getHolidays(startDate, endDate)));
    }
}
