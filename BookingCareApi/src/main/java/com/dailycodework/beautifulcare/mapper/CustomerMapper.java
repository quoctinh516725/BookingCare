package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.CustomerCreateRequest;
import com.dailycodework.beautifulcare.dto.response.CustomerResponse;
import com.dailycodework.beautifulcare.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toCustomer(CustomerCreateRequest request) {
        Customer customer = new Customer();
        customer.setUsername(request.getUsername());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setDob(request.getDob());
        customer.setAddress(request.getAddress());
        customer.setSkinType(request.getSkinType());
        return customer;
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setUsername(customer.getUsername());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setDob(customer.getDob());
        response.setAvatar(customer.getAvatar());
        response.setRole(customer.getRole());
        response.setActive(customer.isActive());
        response.setCreatedAt(customer.getCreatedAt());
        response.setAddress(customer.getAddress());
        response.setSkinType(customer.getSkinType());
        return response;
    }

    public void updateCustomer(Customer customer, CustomerCreateRequest request) {
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
        }
        if (request.getFirstName() != null) {
            customer.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            customer.setLastName(request.getLastName());
        }
        if (request.getDob() != null) {
            customer.setDob(request.getDob());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }
        if (request.getSkinType() != null) {
            customer.setSkinType(request.getSkinType());
        }
    }
}