package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.BookingRequest;
import com.dailycodework.beautifulcare.dto.request.UpdateBookingRequest;
import com.dailycodework.beautifulcare.dto.request.TimeSlotCheckRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.UpdateBookingResponse;
import com.dailycodework.beautifulcare.dto.response.TimeSlotAvailabilityResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.AccessDeniedException;
import com.dailycodework.beautifulcare.exception.BookingConflictException;
import com.dailycodework.beautifulcare.exception.InvalidBookingException;
import com.dailycodework.beautifulcare.exception.InvalidOperationException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.BookingMapper;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.SpecialistRepository;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final ServiceRepository serviceRepository;
    private final SecurityUtils securityUtils;
    private final SpecialistRepository specialistRepository;

    @Override
    public List<BookingResponse> getAllBookings() {
        // Admin/Staff access is checked at controller level with @PreAuthorize
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Check if the user has permission to access this booking
        if (!securityUtils.hasBookingAccess(booking)) {
            throw new AccessDeniedException("You don't have permission to access this booking");
        }

        return bookingMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        log.info("Creating new booking");

        // Make sure customer ID matches the current user (unless admin/staff)
        User currentUser = securityUtils.getOrCreateUser();
        if (!securityUtils.isAdminOrStaff() && !currentUser.getId().equals(request.getCustomerId())) {
            throw new AccessDeniedException("You can only create bookings for yourself");
        }

        // Kiểm tra thời gian đặt lịch
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Cannot create booking for past dates");
        }
        
        // Kiểm tra staff phải là specialist
        if (request.getStaffId() != null) {
            try {
                boolean isSpecialist = specialistRepository.findByUserId(request.getStaffId()).isPresent();
                if (!isSpecialist) {
                    log.warn("Attempted to book with non-specialist staff ID: {}", request.getStaffId());
                    throw new InvalidBookingException("Selected staff is not a specialist");
                }
            } catch (Exception e) {
                log.error("Error validating staff specialist status: {}", e.getMessage(), e);
                throw new InvalidBookingException("Error validating staff status: " + e.getMessage());
            }
        } else {
            log.warn("Booking request without staffId");
        }

        // Chuyển đổi ngày và giờ thành LocalDateTime
        LocalDateTime appointmentTime = request.getBookingDate().atTime(request.getStartTime());

        // Tính thời gian kết thúc dự kiến
        LocalTime endTime = request.getEndTime() != null 
            ? request.getEndTime() 
            : request.getStartTime().plusMinutes(calculateDuration(request.getServiceIds()));

        // Kiểm tra xung đột lịch
        boolean hasConflict = false;
        String conflictReason = null;
        
        if (request.getStaffId() != null) {
            // Nếu chọn nhân viên cụ thể, kiểm tra xung đột dựa trên nhân viên đó
            hasConflict = checkBookingTimeStaffConflict(
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime,
                    request.getStaffId());
            
            if (hasConflict) {
                conflictReason = "STAFF_CONFLICT";
            }
        } else {
            // Nếu không chọn nhân viên cụ thể, kiểm tra xung đột thời gian chung
            hasConflict = checkBookingTimeConflict(
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime);
            
            if (hasConflict) {
                conflictReason = "TIME_CONFLICT";
            }
        }

        if (hasConflict) {
            throw new BookingConflictException(
                "Nhân viên đã có lịch hẹn trong khung giờ này. Vui lòng chọn thời gian khác hoặc nhân viên khác.", 
                conflictReason
            );
        }

        Booking booking = bookingMapper.toBooking(request);
        
        // Đảm bảo appointmentTime được đặt đúng
        booking.setAppointmentTime(appointmentTime);

        // Tính toán tổng giá trị booking dựa trên dịch vụ
        BigDecimal totalPrice = calculateTotalPrice(request.getServiceIds());
        booking.setTotalPrice(totalPrice);

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(UUID id, BookingRequest request) {
        log.info("Updating booking with ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Check if the user has permission to update this booking
        if (!securityUtils.hasBookingAccess(booking)) {
            throw new AccessDeniedException("You don't have permission to update this booking");
        }

        // Customers can only update their own bookings
        User currentUser = securityUtils.getOrCreateUser();
        if (!securityUtils.isAdminOrStaff() && !currentUser.getId().equals(request.getCustomerId())) {
            throw new AccessDeniedException("You can only update your own bookings");
        }

        // Kiểm tra trạng thái hiện tại của booking
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED ||
                booking.getStatus() == BookingStatus.NO_SHOW) {
            throw new InvalidOperationException("Cannot update booking with status: " + booking.getStatus());
        }

        // Kiểm tra thời gian đặt lịch
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Cannot update booking to a past date");
        }

        // Chuyển đổi ngày và giờ thành LocalDateTime
        LocalDateTime appointmentTime = request.getBookingDate().atTime(request.getStartTime());

        // Tính thời gian kết thúc dự kiến
        LocalTime endTime = request.getEndTime() != null 
            ? request.getEndTime() 
            : request.getStartTime().plusMinutes(calculateDuration(request.getServiceIds()));
        
        // Kiểm tra xung đột lịch
        boolean hasConflict = false;
        String conflictReason = null;
        
        if (request.getStaffId() != null) {
            // Nếu chọn nhân viên cụ thể, kiểm tra xung đột dựa trên nhân viên đó
            hasConflict = checkBookingTimeStaffConflictExcludingCurrent(
                    id,
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime,
                    request.getStaffId());
            
            if (hasConflict) {
                conflictReason = "STAFF_CONFLICT";
            }
        } else {
            // Nếu không chọn nhân viên cụ thể, kiểm tra xung đột thời gian chung
            hasConflict = checkBookingTimeConflictExcludingCurrent(
                    id,
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime);
            
            if (hasConflict) {
                conflictReason = "TIME_CONFLICT";
            }
        }

        if (hasConflict) {
            throw new BookingConflictException(
                "Nhân viên đã có lịch hẹn trong khung giờ này. Vui lòng chọn thời gian khác hoặc nhân viên khác.", 
                conflictReason
            );
        }

        bookingMapper.updateBooking(booking, request);

        // Đảm bảo appointmentTime được đặt đúng
        booking.setAppointmentTime(appointmentTime);

        // Cập nhật lại tổng giá
        BigDecimal totalPrice = calculateTotalPrice(request.getServiceIds());
        booking.setTotalPrice(totalPrice);

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public UpdateBookingResponse updateBookingWithDetails(UpdateBookingRequest request) {
        log.info("Updating booking with ID: {}", request.getBookingId());
        
        // Validate booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Check if the user has permission to update this booking
        if (!securityUtils.hasBookingAccess(booking)) {
            throw new AccessDeniedException("You don't have permission to update this booking");
        }

        // Customers can only update their own bookings
        User currentUser = securityUtils.getOrCreateUser();
        if (!securityUtils.isAdminOrStaff() && !currentUser.getId().equals(request.getCustomerId())) {
            throw new AccessDeniedException("You can only update your own bookings");
        }

        // Kiểm tra trạng thái hiện tại của booking
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED ||
                booking.getStatus() == BookingStatus.NO_SHOW) {
            throw new InvalidOperationException("Cannot update booking with status: " + booking.getStatus());
        }

        // Kiểm tra thời gian đặt lịch
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Cannot update booking to a past date");
        }

        // Chuyển đổi ngày và giờ thành LocalDateTime
        LocalDateTime appointmentTime = request.getBookingDate().atTime(request.getStartTime());

        // Tính thời gian kết thúc dự kiến
        LocalTime endTime = request.getEndTime() != null 
            ? request.getEndTime() 
            : request.getStartTime().plusMinutes(calculateDuration(request.getServiceIds()));
        
        // Kiểm tra xung đột lịch
        boolean hasConflict = false;
        String conflictReason = null;
        
        if (request.getStaffId() != null) {
            // Nếu chọn nhân viên cụ thể, kiểm tra xung đột dựa trên nhân viên đó
            hasConflict = checkBookingTimeStaffConflictExcludingCurrent(
                    request.getBookingId(),
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime,
                    request.getStaffId());
            
            if (hasConflict) {
                conflictReason = "STAFF_CONFLICT";
            }
        } else {
            // Nếu không chọn nhân viên cụ thể, kiểm tra xung đột thời gian chung
            hasConflict = checkBookingTimeConflictExcludingCurrent(
                    request.getBookingId(),
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime);
            
            if (hasConflict) {
                conflictReason = "TIME_CONFLICT";
            }
        }

        if (hasConflict) {
            throw new BookingConflictException(
                "Nhân viên đã có lịch hẹn trong khung giờ này. Vui lòng chọn thời gian khác hoặc nhân viên khác.", 
                conflictReason
            );
        }

        // Update booking with new details
        Booking updatedBooking = bookingMapper.toBooking(request);
        
        // Đảm bảo giữ lại customer từ booking ban đầu
        updatedBooking.setCustomer(booking.getCustomer());
        
        // Đảm bảo appointmentTime được đặt đúng
        updatedBooking.setAppointmentTime(appointmentTime);
        
        // Cập nhật lại tổng giá
        BigDecimal totalPrice = calculateTotalPrice(request.getServiceIds());
        updatedBooking.setTotalPrice(totalPrice);

        // Giữ lại trạng thái
        updatedBooking.setStatus(booking.getStatus());
        
        // Set update notes if provided
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            updatedBooking.setNotes(request.getNotes());
        }

        return bookingMapper.toUpdateBookingResponse(bookingRepository.save(updatedBooking));
    }

    @Override
    @Transactional
    public void deleteBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Check if the user has permission to delete this booking
        if (!securityUtils.hasBookingAccess(booking)) {
            throw new AccessDeniedException("You don't have permission to delete this booking");
        }

        // Additional check for booking status - only allow deletion of pending or
        // confirmed bookings
        if (booking.getStatus() != BookingStatus.PENDING &&
                booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidOperationException("Cannot delete booking with status: " + booking.getStatus());
        }

        bookingRepository.deleteById(id);
    }

    @Override
    public List<BookingResponse> getBookingsByCustomer(UUID customerId) {
        // If not admin/staff and not the customer, deny access
        if (!securityUtils.isAdminOrStaff() && !securityUtils.getOrCreateUser().getId().equals(customerId)) {
            throw new AccessDeniedException("You don't have permission to view these bookings");
        }

        return bookingRepository.findByCustomerId(customerId).stream()
                .map(bookingMapper::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByDate(LocalDate date) {
        // Only admin and staff should be able to view bookings by date
        if (!securityUtils.isAdminOrStaff()) {
            throw new AccessDeniedException("Only administrators and staff can view bookings by date");
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return bookingRepository.findByAppointmentTimeBetween(startOfDay, endOfDay).stream()
                .map(bookingMapper::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable) {
        // Admin/Staff access is checked at controller level with @PreAuthorize
        if (status != null) {
            return bookingRepository.findByStatus(status, pageable)
                    .map(bookingMapper::toBookingResponse);
        } else {
            return bookingRepository.findAll(pageable)
                    .map(bookingMapper::toBookingResponse);
        }
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(UUID id, BookingStatus status) {
        log.info("Updating status for booking ID: {} to {}", id, status);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Check if user has permission to update this booking
        User currentUser = securityUtils.getOrCreateUser();
        
        // If user is not admin/staff, they can only cancel their own bookings
        if (!securityUtils.isAdminOrStaff()) {
            if (!currentUser.getId().equals(booking.getCustomer().getId())) {
                throw new AccessDeniedException("You can only cancel your own bookings");
            }
            // Users can only cancel bookings (not update to other statuses)
            if (status != BookingStatus.CANCELLED) {
                throw new AccessDeniedException("You can only cancel bookings");
            }
            // Users can only cancel pending or confirmed bookings
            if (booking.getStatus() != BookingStatus.PENDING && 
                booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new InvalidOperationException("Cannot cancel booking with status: " + booking.getStatus());
            }
        }

        // Validate status transitions
        validateStatusTransition(booking.getStatus(), status);

        booking.setStatus(status);
        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    /**
     * Validate that the status transition is allowed
     */
    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        // Add your status transition validation logic here
        // For example:
        if (currentStatus == BookingStatus.CANCELLED && newStatus != BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot change status of a cancelled booking");
        }
        if (currentStatus == BookingStatus.COMPLETED && newStatus != BookingStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot change status of a completed booking");
        }
        if (currentStatus == BookingStatus.NO_SHOW && newStatus != BookingStatus.NO_SHOW) {
            throw new InvalidOperationException("Cannot change status of a no-show booking");
        }
    }

    /**
     * Check if there is a booking conflict for the given time slot
     */
    private boolean checkBookingTimeConflict(LocalDate date, LocalTime startTime, LocalTime endTime) {
        LocalDateTime startDateTime = date.atTime(startTime);
        LocalDateTime endDateTime = date.atTime(endTime);

        List<Booking> conflictingBookings = bookingRepository.findByAppointmentTimeBetweenAndStatusIn(
                startDateTime,
                endDateTime,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));

        return !conflictingBookings.isEmpty();
    }

    /**
     * Check if there is a booking conflict for the given time slot, excluding the current booking
     */
    private boolean checkBookingTimeConflictExcludingCurrent(UUID bookingId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        LocalDateTime startDateTime = date.atTime(startTime);
        LocalDateTime endDateTime = date.atTime(endTime);

        List<Booking> conflictingBookings = bookingRepository.findByAppointmentTimeBetweenAndStatusInAndIdNot(
                startDateTime,
                endDateTime,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                bookingId);

        return !conflictingBookings.isEmpty();
    }

    /**
     * Check if there is a booking conflict for the given staff and time slot
     */
    private boolean checkBookingTimeStaffConflict(LocalDate date, LocalTime startTime, LocalTime endTime, UUID staffId) {
        LocalDateTime startDateTime = date.atTime(startTime);
        LocalDateTime endDateTime = date.atTime(endTime);

        List<Booking> conflictingBookings = bookingRepository.findByAppointmentTimeBetweenAndStaffIdAndStatusIn(
                startDateTime,
                endDateTime,
                staffId,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));

        return !conflictingBookings.isEmpty();
    }

    /**
     * Check if there is a booking conflict for the given staff and time slot, excluding the current booking
     */
    private boolean checkBookingTimeStaffConflictExcludingCurrent(UUID bookingId, LocalDate date, LocalTime startTime, LocalTime endTime, UUID staffId) {
        LocalDateTime startDateTime = date.atTime(startTime);
        LocalDateTime endDateTime = date.atTime(endTime);

        List<Booking> conflictingBookings = bookingRepository.findByAppointmentTimeBetweenAndStaffIdAndStatusInAndIdNot(
                startDateTime,
                endDateTime,
                staffId,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                bookingId);

        return !conflictingBookings.isEmpty();
    }

    /**
     * Calculate the total duration of all services in minutes
     */
    private int calculateDuration(Set<UUID> serviceIds) {
        return serviceIds.stream()
                .map(id -> serviceRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id)))
                .mapToInt(Service::getDuration)
                .sum();
    }

    /**
     * Calculate the total price of all services
     */
    private BigDecimal calculateTotalPrice(Set<UUID> serviceIds) {
        return serviceIds.stream()
                .map(id -> serviceRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id)))
                .map(Service::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public TimeSlotAvailabilityResponse checkTimeSlotAvailability(TimeSlotCheckRequest request) {
        log.info("Checking availability for time slot: staff={}, date={}, time={}", 
                request.getStaffId(), request.getBookingDate(), request.getStartTime());
        
        try {
            // Tính toán thời gian kết thúc (giả sử là 1 giờ sau thời gian bắt đầu)
            LocalTime endTime = request.getStartTime().plusHours(1);
            
            // Kiểm tra xung đột lịch với nhân viên đã chọn
            boolean hasConflict = checkBookingTimeStaffConflict(
                    request.getBookingDate(),
                    request.getStartTime(),
                    endTime,
                    request.getStaffId());
            
            if (hasConflict) {
                return TimeSlotAvailabilityResponse.builder()
                        .available(false)
                        .reason("STAFF_CONFLICT")
                        .message("The staff member is not available at this time slot")
                        .build();
            }
            
            // Nếu không có xung đột, trả về available = true
            return TimeSlotAvailabilityResponse.builder()
                    .available(true)
                    .reason("AVAILABLE")
                    .message("The time slot is available")
                    .build();
            
        } catch (Exception e) {
            log.error("Error checking time slot availability", e);
            return TimeSlotAvailabilityResponse.builder()
                    .available(false)
                    .reason("ERROR")
                    .message("An error occurred while checking availability")
                    .build();
        }
    }

    @Override
    public List<String> getBookedTimeSlots(UUID staffId, LocalDate date) {
        // Chuyển LocalDate sang LocalDateTime để tìm kiếm
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        // Tìm các lịch hẹn không bị hủy
        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING, 
                BookingStatus.CONFIRMED 
        );
        
        // Lấy tất cả các lịch hẹn trong ngày cho nhân viên đó
        List<Booking> bookings = bookingRepository.findByAppointmentTimeBetweenAndStaffIdAndStatusIn(
                startOfDay, endOfDay, staffId, activeStatuses);
        
        // Chuyển đổi thành danh sách các khung giờ (format: HH:mm)
        return bookings.stream()
                .map(booking -> booking.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<UUID, List<String>> getAllStaffBookedTimeSlots(LocalDate date) {
        // Chuyển LocalDate sang LocalDateTime để tìm kiếm
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        // Tìm các lịch hẹn không bị hủy
        List<BookingStatus> activeStatuses = Arrays.asList(
                BookingStatus.PENDING, 
                BookingStatus.CONFIRMED 
        );
        
        // Lấy tất cả các lịch hẹn trong ngày
        List<Booking> bookings = bookingRepository.findByAppointmentTimeBetweenAndStatusIn(
                startOfDay, endOfDay, activeStatuses);
        
        // Nhóm lịch hẹn theo nhân viên và lấy khung giờ
        Map<UUID, List<String>> result = new HashMap<>();
        
        for (Booking booking : bookings) {
            if (booking.getStaff() != null) {
                UUID staffId = booking.getStaff().getId();
                String timeSlot = booking.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                
                if (!result.containsKey(staffId)) {
                    result.put(staffId, new ArrayList<>());
                }
                
                result.get(staffId).add(timeSlot);
            }
        }
        
        return result;
    }
}