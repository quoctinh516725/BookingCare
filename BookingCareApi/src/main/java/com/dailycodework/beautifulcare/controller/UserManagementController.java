package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.*;
import com.dailycodework.beautifulcare.dto.response.*;
import com.dailycodework.beautifulcare.service.AuthenticationService;
import com.dailycodework.beautifulcare.service.CustomerService;
import com.dailycodework.beautifulcare.service.UserService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "API for managing users, customers, and authentication")
public class UserManagementController {
        private final UserService userService;
        private final CustomerService customerService;
        private final AuthenticationService authenticationService;

        // Authentication endpoints - Truy cập công khai
        @PostMapping("/auth/login")
        @Operation(summary = "Authenticate user and get token")
        public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
                        @Valid @RequestBody AuthenticationRequest request) {
                log.info("REST request to authenticate user");
                AuthenticationResponse result = authenticationService.authenticate(request);
                return ResponseEntity.ok(ApiResponse.success("Authentication successful", result));
        }

        @PostMapping("/auth/validate")
        @Operation(summary = "Validate token")
        public ResponseEntity<ApiResponse<IntrospectResponse>> validateToken(
                        @Valid @RequestBody IntrospectRequest request)
                        throws ParseException, JOSEException {
                log.info("REST request to validate token");
                IntrospectResponse result = authenticationService.introspect(request);
                return ResponseEntity.ok(ApiResponse.success("Token validation successful", result));
        }

        // Generic User endpoints - Chỉ ADMIN
        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping
        @Operation(summary = "Create a new user")
        public ResponseEntity<ApiResponse<UserResponse>> createUser(
                        @Valid @RequestBody UserCreateRequest request) {
                log.info("REST request to create a new user");
                UserResponse createdUser = userService.createUser(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("User created successfully", createdUser));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping
        @Operation(summary = "Get all users")
        public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
                log.info("REST request to get all users");
                List<UserResponse> users = userService.getAllUsers();
                return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        }

        // Endpoint xem thông tin người dùng - Chỉ user đó hoặc ADMIN
        @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#userId)")
        @GetMapping("/{userId}")
        @Operation(summary = "Get user by ID")
        public ResponseEntity<ApiResponse<UserResponse>> getUserById(
                        @PathVariable("userId") String userId) {
                log.info("REST request to get user by id: {}", userId);
                UserResponse user = userService.getUserById(userId);
                return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        }

        @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#userId)")
        @PutMapping("/{userId}")
        @Operation(summary = "Update user")
        public ResponseEntity<ApiResponse<UserResponse>> updateUser(
                        @PathVariable String userId,
                        @Valid @RequestBody UserUpdateRequest request) {
                log.info("REST request to update user with id: {}", userId);
                UserResponse updatedUser = userService.updateUser(userId, request);
                return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/{userId}")
        @Operation(summary = "Delete user")
        public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
                log.info("REST request to delete user with id: {}", userId);
                userService.deleteUser(userId);
                return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        }

        // Customer-specific endpoints - Chỉ ADMIN hoặc user đó
        /**
         * Create a new customer.
         * Only administrators can set roles other than CUSTOMER.
         * If a role is specified in the request and the user is an admin, the specified
         * role will be used.
         * Otherwise, the CUSTOMER role will be assigned by default.
         */
        @PostMapping("/customers")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Create a new customer")
        public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
                        @Valid @RequestBody CustomerCreateRequest request) {
                log.info("REST request to create customer: {}", request.getUsername());

                // Only admins are allowed to set custom roles - others will default to CUSTOMER
                CustomerResponse response = customerService.createCustomer(request);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Customer created successfully", response));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/customers")
        @Operation(summary = "Get all customers")
        public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
                log.info("REST request to get all customers");
                List<CustomerResponse> customers = customerService.getAllCustomers();
                return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
        }

        @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(authentication, #customerId)")
        @GetMapping("/customers/{customerId}")
        @Operation(summary = "Get customer by ID")
        public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(
                        @PathVariable String customerId) {
                log.info("REST request to get customer by id: {}", customerId);
                CustomerResponse customer = customerService.getCustomerById(customerId);
                return ResponseEntity.ok(ApiResponse.success("Customer retrieved successfully", customer));
        }

        @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(authentication, #customerId)")
        @PutMapping("/customers/{customerId}")
        @Operation(summary = "Update customer")
        public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
                        @PathVariable String customerId,
                        @Valid @RequestBody CustomerCreateRequest request) {
                log.info("REST request to update customer with id: {}", customerId);
                CustomerResponse updatedCustomer = customerService.updateCustomer(customerId, request);
                return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", updatedCustomer));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/customers/{customerId}")
        @Operation(summary = "Delete customer")
        public ResponseEntity<ApiResponse<Void>> deleteCustomer(
                        @PathVariable String customerId) {
                log.info("REST request to delete customer with id: {}", customerId);
                customerService.deleteCustomer(customerId);
                return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully", null));
        }

        @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(authentication, #customerId)")
        @GetMapping("/customers/{customerId}/bookings")
        @Operation(summary = "Get customer bookings")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(
                        @PathVariable String customerId) {
                log.info("REST request to get bookings for customer with id: {}", customerId);
                List<BookingResponse> bookings = customerService.getCustomerBookings(customerId);
                return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved successfully", bookings));
        }
}