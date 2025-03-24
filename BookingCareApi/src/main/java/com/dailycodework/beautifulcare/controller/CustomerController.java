package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.CustomerCreateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.CustomerResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;
import com.dailycodework.beautifulcare.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @deprecated This controller is deprecated and will be removed in a future
 *             release.
 *             Please use {@link UserManagementController} instead with
 *             endpoints /api/v1/users/customers/*
 */
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Slf4j
@Deprecated(forRemoval = true)
@Tag(name = "Customers (Deprecated)", description = "Deprecated API for customer management. Use /api/v1/users/customers/* instead.")
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping
    @Deprecated
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CustomerCreateRequest request) {
        log.info("REST request to create a new customer (deprecated)");
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created successfully", response));
    }

    @GetMapping
    @Deprecated
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        log.info("REST request to get all customers (deprecated)");
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/{id}")
    @Deprecated
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable String id) {
        log.info("REST request to get customer by id: {} (deprecated)", id);
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success("Customer retrieved successfully", customer));
    }

    @PutMapping("/{id}")
    @Deprecated
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerCreateRequest request) {
        log.info("REST request to update customer with id: {} (deprecated)", id);
        CustomerResponse updatedCustomer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", updatedCustomer));
    }

    @DeleteMapping("/{id}")
    @Deprecated
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable String id) {
        log.info("REST request to delete customer with id: {} (deprecated)", id);
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully", null));
    }

    @GetMapping("/{id}/bookings")
    @Deprecated
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(@PathVariable String id) {
        log.info("REST request to get bookings for customer with id: {} (deprecated)", id);
        List<BookingResponse> bookings = customerService.getCustomerBookings(id);
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved successfully", bookings));
    }

    @GetMapping("/{id}/skin-test-results")
    @Deprecated
    public ResponseEntity<ApiResponse<List<SkinTestResultResponse>>> getCustomerSkinTestResults(
            @PathVariable String id) {
        log.info("REST request to get skin test results for customer with id: {} (deprecated)", id);
        List<SkinTestResultResponse> results = customerService.getCustomerSkinTestResults(id);
        return ResponseEntity.ok(ApiResponse.success("Customer skin test results retrieved successfully", results));
    }
}