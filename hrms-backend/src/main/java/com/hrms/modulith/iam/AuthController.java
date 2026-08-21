package com.hrms.modulith.iam;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.iam.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & IAM", description = "Endpoints for user authentication, registration, and profile")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.ok("User registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/register-credentials")
    @Operation(summary = "Create credentials before role assignment")
    public ResponseEntity<ApiResponse<UserDto>> registerCredentials(@Valid @RequestBody RegisterRequest request) {
        UserDto response = authService.registerCredentials(request);
        return new ResponseEntity<>(ApiResponse.ok("Credentials created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UserDto user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for currently authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
