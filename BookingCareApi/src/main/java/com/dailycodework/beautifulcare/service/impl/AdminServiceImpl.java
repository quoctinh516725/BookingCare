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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    public AdminStatsResponse getAdminStats() {
        try {
            // Đếm số lượng người dùng và chuyên viên
            long userCount = userRepository.count();
            long staffCount = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == UserRole.STAFF)
                    .count();
            
            // Đếm số lượng dịch vụ
            long serviceCount = serviceRepository.count();
            
            // Đếm số lượng lịch đặt
            long bookingCount = bookingRepository.count();
            
            // Tính tổng doanh thu
            double revenue = bookingRepository.findAll().stream()
                    .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                    .flatMap(booking -> booking.getServices().stream())
                    .mapToDouble(service -> service.getPrice().doubleValue())
                    .sum();
            
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
            log.error("Error getting admin stats", e);
            // Trả về dữ liệu giả nếu có lỗi
            return getDefaultStats();
        }
    }

    @Override
    public List<BookingResponse> getRecentBookings(int limit) {
        try {
            PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<Booking> bookings = bookingRepository.findAll(pageRequest).getContent();
            
            return bookings.stream()
                    .map(this::mapToBookingResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting recent bookings", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<PopularServiceResponse> getPopularServices(int limit) {
        try {
            List<Service> services = serviceRepository.findAll(PageRequest.of(0, limit)).getContent();
            List<PopularServiceResponse> result = new ArrayList<>();
            
            for (Service service : services) {
                // Đếm số lượng đặt cho mỗi dịch vụ
                long bookingCount = bookingRepository.findAll().stream()
                        .filter(booking -> booking.getServices().contains(service))
                        .count();
                
                // Tính doanh thu từ dịch vụ này
                double revenue = bookingCount * service.getPrice().doubleValue();
                
                result.add(PopularServiceResponse.builder()
                        .id(service.getId().toString())
                        .name(service.getName())
                        .description(service.getDescription())
                        .price(service.getPrice().doubleValue())
                        .bookingCount(bookingCount)
                        .revenue(revenue)
                        .build());
            }
            
            // Sắp xếp theo số lượng đặt giảm dần
            return result.stream()
                    .sorted((s1, s2) -> Long.compare(s2.getBookingCount(), s1.getBookingCount()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting popular services", e);
            return new ArrayList<>();
        }
    }
    
    // Helper method to map Booking entity to BookingResponse DTO
    private BookingResponse mapToBookingResponse(Booking booking) {
        String customerName = "Unknown";
        if (booking.getCustomer() != null) {
            customerName = booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName();
        }
        
        String formattedDateTime = "";
        if (booking.getAppointmentTime() != null) {
            formattedDateTime = booking.getAppointmentTime().format(DATE_TIME_FORMATTER);
        }
        
        // Chuyển đổi các dịch vụ
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
        
        return BookingResponse.builder()
            .id(booking.getId())
            .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
            .customerName(customerName)
            .customerEmail(booking.getCustomer() != null ? booking.getCustomer().getEmail() : null)
            .customerPhone(booking.getCustomer() != null ? booking.getCustomer().getPhone() : null)
            .staffId(booking.getStaff() != null ? booking.getStaff().getId() : null)
            .staffName(booking.getStaff() != null ? booking.getStaff().getFirstName() + " " + booking.getStaff().getLastName() : null)
            .status(booking.getStatus())
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