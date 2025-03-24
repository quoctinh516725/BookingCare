package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.CustomerCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.CustomerResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;

import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerCreateRequest request);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse getCustomerById(String id);

    CustomerResponse updateCustomer(String id, CustomerCreateRequest request);

    void deleteCustomer(String id);

    List<BookingResponse> getCustomerBookings(String id);

    List<SkinTestResultResponse> getCustomerSkinTestResults(String id);
}