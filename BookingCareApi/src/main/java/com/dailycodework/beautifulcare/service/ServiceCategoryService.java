package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceCategoryService {
    /**
     * Lấy danh sách tất cả danh mục dịch vụ
     * @return Danh sách danh mục dịch vụ
     */
    List<ServiceCategoryResponse> getAllCategories();
    
    /**
     * Lấy danh sách danh mục dịch vụ đang hoạt động
     * @return Danh sách danh mục dịch vụ đang hoạt động
     */
    List<ServiceCategoryResponse> getActiveCategories();
    
    /**
     * Lấy danh mục dịch vụ theo ID
     * @param id ID danh mục
     * @return Thông tin danh mục
     */
    ServiceCategoryResponse getCategoryById(UUID id);
    
    /**
     * Tạo danh mục mới
     * @param request Thông tin danh mục cần tạo
     * @return Thông tin danh mục đã tạo
     */
    ServiceCategoryResponse createCategory(ServiceCategoryRequest request);
    
    /**
     * Cập nhật danh mục
     * @param id ID danh mục
     * @param request Thông tin cập nhật
     * @return Thông tin danh mục đã cập nhật
     */
    ServiceCategoryResponse updateCategory(UUID id, ServiceCategoryRequest request);
    
    /**
     * Xóa danh mục
     * @param id ID danh mục cần xóa
     */
    void deleteCategory(UUID id);
    
    /**
     * Lấy danh sách dịch vụ theo danh mục
     * @param categoryId ID danh mục
     * @return Danh sách dịch vụ thuộc danh mục
     */
    List<ServiceResponse> getServicesByCategory(UUID categoryId);
} 