package com.hrms.modulith.attendance;

import com.hrms.modulith.attendance.dto.AttendanceRecordDto;
import com.hrms.modulith.attendance.dto.AttendanceStatsDto;
import com.hrms.modulith.attendance.dto.PunchRequest;
import com.hrms.modulith.attendance.dto.PunchStatusDto;
import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.leave.LeaveApprovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;

    @Transactional
    public PunchStatusDto punchIn(PunchRequest request) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Optional<AttendanceRecord> existing = attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), today);
        if (existing.isPresent() && existing.get().getClockIn() != null && existing.get().getClockOut() == null) {
            throw new BadRequestException("Employee is already clocked in today");
        }

        AttendanceRecord record = existing.orElseGet(() -> AttendanceRecord.builder()
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName())
                .date(today)
                .build());

        record.setClockIn(now);
        record.setClockOut(null);

        // Determine if late (assuming 09:30:00 standard start)
        if (now.isAfter(LocalTime.of(9, 30))) {
            record.setStatus(AttendanceStatus.LATE);
        } else {
            record.setStatus(AttendanceStatus.PRESENT);
        }

        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        record = attendanceRepository.save(record);
        log.info("Employee {} clocked in at {}", request.getEmployeeId(), now);

        return PunchStatusDto.builder()
                .isClockedIn(true)
                .clockInTime(record.getClockIn())
                .clockOutTime(null)
                .elapsedSeconds(0)
                .workHours(0.0)
                .status(record.getStatus().getDisplayName())
                .build();
    }

    @Transactional
    public PunchStatusDto punchOut(PunchRequest request) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        AttendanceRecord record = attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), today)
                .orElseThrow(() -> new BadRequestException("No punch in record found for today"));

        if (record.getClockIn() == null) {
            throw new BadRequestException("Employee has not punched in today");
        }

        record.setClockOut(now);
        Duration duration = Duration.between(record.getClockIn(), now);
        double hours = (double) duration.toMinutes() / 60.0;
        record.setWorkHours(Math.round(hours * 100.0) / 100.0);

        if (hours >= 8.5) {
            record.setOvertime(true);
        }
        if (hours < 4.5 && record.getStatus() != AttendanceStatus.ON_LEAVE) {
            record.setStatus(AttendanceStatus.HALF_DAY);
        }

        record = attendanceRepository.save(record);
        log.info("Employee {} clocked out at {} (Work hours: {})", request.getEmployeeId(), now, record.getWorkHours());

        return PunchStatusDto.builder()
                .isClockedIn(false)
                .clockInTime(record.getClockIn())
                .clockOutTime(record.getClockOut())
                .elapsedSeconds(duration.getSeconds())
                .workHours(record.getWorkHours())
                .status(record.getStatus().getDisplayName())
                .build();
    }

    @Transactional(readOnly = true)
    public PunchStatusDto getTodayPunchStatus(String employeeId) {
        LocalDate today = LocalDate.now();
        Optional<AttendanceRecord> opt = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        if (opt.isEmpty()) {
            return PunchStatusDto.builder()
                    .isClockedIn(false)
                    .clockInTime(null)
                    .clockOutTime(null)
                    .elapsedSeconds(0)
                    .workHours(0.0)
                    .status("Not Clocked In")
                    .build();
        }

        AttendanceRecord record = opt.get();
        boolean clockedIn = record.getClockIn() != null && record.getClockOut() == null;
        long elapsed = 0;
        if (clockedIn) {
            elapsed = Duration.between(record.getClockIn(), LocalTime.now()).getSeconds();
        } else if (record.getClockIn() != null && record.getClockOut() != null) {
            elapsed = Duration.between(record.getClockIn(), record.getClockOut()).getSeconds();
        }

        return PunchStatusDto.builder()
                .isClockedIn(clockedIn)
                .clockInTime(record.getClockIn())
                .clockOutTime(record.getClockOut())
                .elapsedSeconds(elapsed)
                .workHours(record.getWorkHours() != null ? record.getWorkHours() : (double) elapsed / 3600.0)
                .status(record.getStatus().getDisplayName())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceRecords(String employeeId, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> list;
        if (employeeId != null && startDate != null && endDate != null) {
            list = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        } else if (employeeId != null) {
            list = attendanceRepository.findByEmployeeIdOrderByDateDesc(employeeId);
        } else if (startDate != null && endDate != null) {
            list = attendanceRepository.findByDateBetween(startDate, endDate);
        } else {
            list = attendanceRepository.findByDate(LocalDate.now());
        }

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceStatsDto getAttendanceStats() {
        LocalDate today = LocalDate.now();
        long present = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long late = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.LATE);
        long onLeave = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ON_LEAVE);
        long absent = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT);

        List<AttendanceRecord> todayRecords = attendanceRepository.findByDate(today);
        double avgHours = todayRecords.stream()
                .filter(r -> r.getWorkHours() != null)
                .mapToDouble(AttendanceRecord::getWorkHours)
                .average()
                .orElse(8.0);

        long totalCount = present + late + onLeave + absent;
        double onTimePct = totalCount > 0 ? ((double) present / (present + late)) * 100.0 : 92.5;

        return AttendanceStatsDto.builder()
                .presentToday(present)
                .lateToday(late)
                .onLeaveToday(onLeave)
                .absentToday(absent)
                .averageWorkingHours(Math.round(avgHours * 10.0) / 10.0)
                .onTimePercentage(Math.round(onTimePct * 10.0) / 10.0)
                .build();
    }

    @ApplicationModuleListener
    public void onLeaveApproved(LeaveApprovedEvent event) {
        log.info("Attendance module received LeaveApprovedEvent for employee: {} ({} to {})",
                event.employeeId(), event.startDate(), event.endDate());

        LocalDate current = event.startDate();
        while (!current.isAfter(event.endDate())) {
            final LocalDate recordDate = current;
            Optional<AttendanceRecord> opt = attendanceRepository.findByEmployeeIdAndDate(event.employeeId(), recordDate);
            AttendanceRecord record = opt.orElseGet(() -> AttendanceRecord.builder()
                    .employeeId(event.employeeId())
                    .employeeName(event.employeeName())
                    .date(recordDate)
                    .build());

            record.setStatus(AttendanceStatus.ON_LEAVE);
            record.setNotes("Approved leave: " + event.leaveType());
            record.setWorkHours(0.0);
            attendanceRepository.save(record);

            current = current.plusDays(1);
        }
    }

    private AttendanceRecordDto mapToDto(AttendanceRecord r) {
        return AttendanceRecordDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployeeId())
                .employeeName(r.getEmployeeName())
                .date(r.getDate())
                .clockIn(r.getClockIn())
                .clockOut(r.getClockOut())
                .workHours(r.getWorkHours())
                .status(r.getStatus().getDisplayName())
                .notes(r.getNotes())
                .isOvertime(r.isOvertime())
                .build();
    }
}
