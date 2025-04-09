package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.ServiceRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceService {
    /**
     * Lấy danh sách tất cả dịch vụ
     * @return Danh sách dịch vụ
     */
    List<ServiceResponse> getAllServices();

    /**
     * Lấy dịch vụ theo ID
     * @param id ID dịch vụ
     * @return Thông tin dịch vụ
     */
    ServiceResponse getServiceById(UUID id);
    
    /**
     * Lấy danh sách dịch vụ theo danh mục
     * @param categoryId ID danh mục
     * @return Danh sách dịch vụ thuộc danh mục
     */
    List<ServiceResponse> getServicesByCategory(UUID categoryId);

    /**
     * Tạo dịch vụ mới
     * @param request Thông tin dịch vụ cần tạo
     * @return Thông tin dịch vụ đã tạo
     */
    ServiceResponse createService(ServiceRequest request);

    /**
     * Cập nhật dịch vụ
     * @param id ID dịch vụ
     * @param request Thông tin cập nhật
     * @return Thông tin dịch vụ đã cập nhật
     */
    ServiceResponse updateService(UUID id, ServiceRequest request);

    /**
     * Xóa dịch vụ
     * @param id ID dịch vụ cần xóa
     */
    void deleteService(UUID id);
}