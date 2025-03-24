package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.CustomerCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.CustomerResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;
import com.dailycodework.beautifulcare.entity.Customer;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.CustomerMapper;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.CustomerRepository;
import com.dailycodework.beautifulcare.repository.SkinTestResultRepository;
import com.dailycodework.beautifulcare.service.CustomerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the CustomerService interface.
 * This class provides customer-related business logic such as creating,
 * updating,
 * and retrieving customers.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CustomerServiceImpl implements CustomerService {
    CustomerRepository customerRepository;
    BookingRepository bookingRepository;
    SkinTestResultRepository skinTestResultRepository;
    CustomerMapper customerMapper;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        log.info("Creating customer with username: {}", request.getUsername());

        // Check if email already exists
        if (customerRepository.existsByEmail(request.getEmail())) {
            log.warn("Email {} already exists", request.getEmail());
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        Customer customer = customerMapper.toCustomer(request);

        // Check if role is set to something other than CUSTOMER, which requires ADMIN
        // rights
        if (request.getRole() != null && request.getRole() != UserRole.CUSTOMER) {
            // Get current authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = authentication != null &&
                    authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

            if (!isAdmin) {
                log.warn("Non-admin user attempted to create a user with role: {}", request.getRole());
                // Force to CUSTOMER role for non-admins
                customer.setRole(UserRole.CUSTOMER);
            } else {
                // Admin can set any role
                customer.setRole(request.getRole());
                log.info("Admin created user with custom role: {}", request.getRole());
            }
        } else {
            // Default to CUSTOMER role if none specified
            customer.setRole(UserRole.CUSTOMER);
        }

        // Encode password
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setActive(true);

        try {
            Customer savedCustomer = customerRepository.save(customer);
            log.info("Customer created successfully with id: {}", savedCustomer.getId());
            return customerMapper.toCustomerResponse(savedCustomer);
        } catch (Exception e) {
            log.error("Error creating customer: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error creating customer");
        }
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse getCustomerById(String id) {
        return customerMapper.toCustomerResponse(findCustomerById(id));
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(String id, CustomerCreateRequest request) {
        log.info("Updating customer with id: {}", id);

        Customer customer = findCustomerById(id);

        customerMapper.updateCustomer(customer, request);

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update role if provided, but only admins can change roles
        if (request.getRole() != null && request.getRole() != customer.getRole()) {
            // Get current authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = authentication != null &&
                    authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

            if (!isAdmin) {
                log.warn("Non-admin user attempted to change role to: {}", request.getRole());
                // Ignore role change for non-admins
            } else {
                // Admin can change to any role
                customer.setRole(request.getRole());
                log.info("Admin updated user role to: {}", request.getRole());
            }
        }

        try {
            Customer updatedCustomer = customerRepository.save(customer);
            log.info("Customer updated successfully with id: {}", updatedCustomer.getId());
            return customerMapper.toCustomerResponse(updatedCustomer);
        } catch (Exception e) {
            log.error("Error updating customer: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error updating customer");
        }
    }

    @Override
    @Transactional
    public void deleteCustomer(String id) {
        Customer customer = findCustomerById(id);
        customerRepository.delete(customer);
    }

    @Override
    public List<BookingResponse> getCustomerBookings(String id) {
        // Verify customer exists
        findCustomerById(id);

        // This would be implemented with proper mapping to BookingResponse
        // For now, returning empty list as mapping is not fully implemented
        return List.of();
    }

    @Override
    public List<SkinTestResultResponse> getCustomerSkinTestResults(String id) {
        // Verify customer exists
        findCustomerById(id);

        // This would be implemented with proper mapping to SkinTestResultResponse
        // For now, returning empty list as mapping is not fully implemented
        return List.of();
    }

    private Customer findCustomerById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}