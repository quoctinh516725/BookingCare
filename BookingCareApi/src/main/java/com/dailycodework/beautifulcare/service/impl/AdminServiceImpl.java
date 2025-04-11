package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.response.AdminStatsResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.PopularServiceResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    @Override
    @Cacheable(value = "adminStats", key = "'stats'", unless = "#result == null")
    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        try {
            log.info("Calculating admin statistics");
            
            // Đếm số lượng người dùng và chuyên viên - Sử dụng 1 truy vấn đếm theo role
            long userCount = userRepository.count();
            long staffCount = userRepository.countByRole(UserRole.STAFF);
            
            // Đếm số lượng dịch vụ
            long serviceCount = serviceRepository.count();
            
            // Đếm số lượng lịch đặt và tính tổng doanh thu bằng các truy vấn tối ưu
            long bookingCount = bookingRepository.count();
            
            // Lấy tổng doanh thu từ truy vấn ứng gộp
            Double revenueValue = bookingRepository.calculateTotalRevenue();
            double revenue = revenueValue != null ? revenueValue : 0.0;
            
            log.info("Statistics calculated: users={}, staff={}, services={}, bookings={}, revenue={}", 
                    userCount, staffCount, serviceCount, bookingCount, revenue);
            
            // Tạo đối tượng phản hồi với dữ liệu thống kê
            return AdminStatsResponse.builder()
                    .userCount(userCount)
                    .userGrowth(5.0) // Giả lập dữ liệu tăng trưởng 5%
                    .serviceCount(serviceCount)
                    .serviceGrowth(2.5) // Giả lập dữ liệu tăng trưởng 2.5%
                    .staffCount(staffCount)
                    .staffGrowth(1) // Giả lập thêm 1 nhân viên mới
                    .bookingCount(bookingCount)
                    .bookingGrowth(7.5) // Giả lập dữ liệu tăng trưởng 7.5%
                    .revenue(revenue)
                    .revenueGrowth(10.0) // Giả lập dữ liệu tăng trưởng 10%
                    .build();
        } catch (Exception e) {
            log.error("Error getting admin stats: {}", e.getMessage(), e);
            // Trả về dữ liệu giả nếu có lỗi
            return getDefaultStats();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRecentBookings(int limit) {
        try {
            log.info("Fetching recent bookings with limit: {}", limit);
            
            // Add explicit sorting by created_at DESC
            PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<Booking> bookings = bookingRepository.findRecentBookingsWithFullDetails(pageRequest);
            
            List<BookingResponse> result = bookings.stream()
                    .map(this::mapToBookingResponse)
                    .collect(Collectors.toList());
            
            log.info("Found {} recent bookings", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error getting recent bookings: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "popularServices", key = "#limit", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<PopularServiceResponse> getPopularServices(int limit) {
        try {
            log.info("Fetching popular services with limit: {}", limit);
            
            // Sử dụng phương thức tối ưu để lấy dịch vụ phổ biến kèm số lượng đặt
            PageRequest pageRequest = PageRequest.of(0, limit);
            List<Service> services = serviceRepository.findPopularServices(pageRequest);
            
            List<PopularServiceResponse> result = new ArrayList<>();
            
            for (Service service : services) {
                // Đếm số lượng đặt (đã được tải cùng với service)
                long bookingCount = service.getBookings() != null ? service.getBookings().size() : 0;
                
                // Tính doanh thu từ dịch vụ này
                double revenue = service.getPrice() != null ? bookingCount * service.getPrice().doubleValue() : 0.0;
                
                result.add(PopularServiceResponse.builder()
                        .id(service.getId().toString())
                        .name(service.getName())
                        .description(service.getDescription())
                        .price(service.getPrice() != null ? service.getPrice().doubleValue() : 0.0)
                        .bookingCount(bookingCount)
                        .revenue(revenue)
                        .build());
            }
            
            log.info("Found {} popular services", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error getting popular services: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    // Helper method to map Booking entity to BookingResponse DTO
    private BookingResponse mapToBookingResponse(Booking booking) {
        // Customer info
        String customerName = "Unknown";
        if (booking.getCustomer() != null) {
            String firstName = booking.getCustomer().getFirstName() != null ? booking.getCustomer().getFirstName() : "";
            String lastName = booking.getCustomer().getLastName() != null ? booking.getCustomer().getLastName() : "";
            customerName = firstName + " " + lastName;
        }
        
        // Staff info
        String staffName = "Not Assigned";
        if (booking.getStaff() != null) {
            String firstName = booking.getStaff().getFirstName() != null ? booking.getStaff().getFirstName() : "";
            String lastName = booking.getStaff().getLastName() != null ? booking.getStaff().getLastName() : "";
            staffName = firstName + " " + lastName;
        }
        
        // Format datetime
        String formattedDateTime = "";
        if (booking.getAppointmentTime() != null) {
            formattedDateTime = booking.getAppointmentTime().format(DATE_TIME_FORMATTER);
        }
        
        // Map services
        Set<BookingResponse.ServiceDetail> serviceDetails = new HashSet<>();
        if (booking.getServices() != null) {
            serviceDetails = booking.getServices().stream()
                .map(service -> BookingResponse.ServiceDetail.builder()
                    .id(service.getId())
                    .name(service.getName())
                    .description(service.getDescription())
                    .price(service.getPrice())
                    .duration(service.getDuration())
                    .image(service.getImageUrl())
                    .build())
                .collect(Collectors.toSet());
        }
        
        // Ensure status is not null and handle legacy statuses
        BookingStatus status = booking.getStatus();
        if (status == null) {
            status = BookingStatus.PENDING;
        }
        
        // Build response
        return BookingResponse.builder()
            .id(booking.getId())
            .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
            .customerName(customerName)
            .customerEmail(booking.getCustomer() != null ? booking.getCustomer().getEmail() : null)
            .customerPhone(booking.getCustomer() != null ? booking.getCustomer().getPhone() : null)
            .staffId(booking.getStaff() != null ? booking.getStaff().getId() : null)
            .staffName(staffName)
            .status(status)
            .bookingDate(booking.getAppointmentTime() != null ? booking.getAppointmentTime().toLocalDate() : null)
            .startTime(booking.getAppointmentTime() != null ? booking.getAppointmentTime().toLocalTime() : null)
            .formattedDateTime(formattedDateTime)
            .notes(booking.getNotes())
            .totalPrice(booking.getTotalPrice())
            .services(serviceDetails)
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .build();
    }
    
    // Default stats in case of errors
    private AdminStatsResponse getDefaultStats() {
        return AdminStatsResponse.builder()
                .userCount(0)
                .userGrowth(0)
                .serviceCount(0)
                .serviceGrowth(0)
                .staffCount(0)
                .staffGrowth(0)
                .bookingCount(0)
                .bookingGrowth(0)
                .revenue(0)
                .revenueGrowth(0)
                .build();
    }
} 