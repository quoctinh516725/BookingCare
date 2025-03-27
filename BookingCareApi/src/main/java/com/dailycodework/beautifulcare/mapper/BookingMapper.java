package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.BookingRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class BookingMapper {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected ServiceRepository serviceRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", source = "customerId", qualifiedByName = "findUserById")
    @Mapping(target = "services", source = "serviceIds", qualifiedByName = "findServicesByIds")
    @Mapping(target = "appointmentTime", source = "bookingDate")
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Booking toBooking(BookingRequest request);

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer", qualifiedByName = "getFullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "customerPhone", source = "customer.phone")
    @Mapping(target = "statusDescription", source = "status", qualifiedByName = "getStatusDescription")
    @Mapping(target = "services", source = "services", qualifiedByName = "toServiceDetails")
    @Mapping(target = "bookingDate", source = "appointmentTime", qualifiedByName = "getBookingDate")
    @Mapping(target = "startTime", source = "appointmentTime", qualifiedByName = "getStartTime")
    @Mapping(target = "endTime", source = "appointmentTime", qualifiedByName = "getEndTime")
    @Mapping(target = "formattedDateTime", source = "appointmentTime", qualifiedByName = "formatDateTime")
    @Mapping(target = "canCancel", source = "status", qualifiedByName = "canCancelBooking")
    public abstract BookingResponse toBookingResponse(Booking booking);

    public List<BookingResponse> toBookingResponses(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Named("findUserById")
    protected User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Named("findServicesByIds")
    protected Set<Service> findServicesByIds(Set<UUID> ids) {
        Set<Service> services = ids.stream()
                .map(id -> serviceRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id)))
                .collect(Collectors.toSet());

        if (services.size() != ids.size()) {
            throw new ResourceNotFoundException("One or more services could not be found");
        }

        return services;
    }

    @Named("getFullName")
    protected String getFullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }

    @Named("getStatusDescription")
    protected String getStatusDescription(BookingStatus status) {
        switch (status) {
            case PENDING:
                return "Đang chờ xác nhận";
            case CONFIRMED:
                return "Đã xác nhận";
            case CANCELLED:
                return "Đã hủy";
            case COMPLETED:
                return "Đã hoàn thành";
            case NO_SHOW:
                return "Không đến";
            default:
                return "Không xác định";
        }
    }

    @Named("toServiceDetails")
    protected Set<BookingResponse.ServiceDetail> toServiceDetails(Set<Service> services) {
        return services.stream()
                .map(service -> {
                    BookingResponse.ServiceDetail detail = new BookingResponse.ServiceDetail();
                    detail.setId(service.getId());
                    detail.setName(service.getName());
                    detail.setDescription(service.getDescription());
                    detail.setPrice(service.getPrice());
                    detail.setDuration(service.getDuration());
                    detail.setImage(service.getImageUrl());
                    return detail;
                })
                .collect(Collectors.toSet());
    }

    @Named("getBookingDate")
    protected LocalDate getBookingDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }

    @Named("getStartTime")
    protected LocalTime getStartTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalTime() : null;
    }

    @Named("getEndTime")
    protected LocalTime getEndTime(LocalDateTime dateTime) {
        if (dateTime == null)
            return null;
        // Giả sử thời gian kết thúc là 1 giờ sau khi bắt đầu
        return dateTime.toLocalTime().plusHours(1);
    }

    @Named("formatDateTime")
    protected String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }

    @Named("canCancelBooking")
    protected boolean canCancelBooking(BookingStatus status) {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "appointmentTime", source = "bookingDate")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void updateBooking(@MappingTarget Booking booking, BookingRequest request);
}