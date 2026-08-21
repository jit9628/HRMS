package com.hrms.modulith.attendance;

import com.hrms.modulith.attendance.dto.AttendanceRecordDto;
import com.hrms.modulith.attendance.dto.AttendanceStatsDto;
import com.hrms.modulith.attendance.dto.PunchRequest;
import com.hrms.modulith.attendance.dto.PunchStatusDto;
import com.hrms.modulith.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance & Time Tracking", description = "Endpoints for clocking in/out, daily attendance tracking, and work hours analytics")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/punch-in")
    @Operation(summary = "Punch / Clock in for today")
    public ResponseEntity<ApiResponse<PunchStatusDto>> punchIn(@RequestBody PunchRequest request) {
        PunchStatusDto status = attendanceService.punchIn(request);
        return ResponseEntity.ok(ApiResponse.ok("Clocked in successfully", status));
    }

    @PostMapping("/punch-out")
    @Operation(summary = "Punch / Clock out for today")
    public ResponseEntity<ApiResponse<PunchStatusDto>> punchOut(@RequestBody PunchRequest request) {
        PunchStatusDto status = attendanceService.punchOut(request);
        return ResponseEntity.ok(ApiResponse.ok("Clocked out successfully", status));
    }

    @GetMapping("/today-status")
    @Operation(summary = "Get current day's clock status and live elapsed timer")
    public ResponseEntity<ApiResponse<PunchStatusDto>> getTodayStatus(@RequestParam String employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getTodayPunchStatus(employeeId)));
    }

    @GetMapping("/records")
    @Operation(summary = "Get attendance logs by employee and/or date range")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getAttendanceRecords(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<AttendanceRecordDto> list = attendanceService.getAttendanceRecords(employeeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get attendance summary statistics")
    public ResponseEntity<ApiResponse<AttendanceStatsDto>> getAttendanceStats() {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceStats()));
    }
}
