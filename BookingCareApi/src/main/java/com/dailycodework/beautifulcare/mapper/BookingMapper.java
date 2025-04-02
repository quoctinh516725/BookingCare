package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.BookingRequest;
import com.dailycodework.beautifulcare.dto.request.UpdateBookingRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.UpdateBookingResponse;
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

@Mapper(componentModel = "spring", imports = {LocalDateTime.class, LocalDate.class, LocalTime.class})
public abstract class BookingMapper {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected ServiceRepository serviceRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", source = "customerId", qualifiedByName = "findUserById")
    @Mapping(target = "staff", source = "staffId", qualifiedByName = "findUserById")
    @Mapping(target = "services", source = "serviceIds", qualifiedByName = "findServicesByIds")
    @Mapping(target = "appointmentTime", expression = "java(createAppointmentTimeMethod(request))")
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Booking toBooking(BookingRequest request);

    protected LocalDateTime createAppointmentTimeMethod(BookingRequest request) {
        if (request.getBookingDate() == null || request.getStartTime() == null) {
            return null;
        }
        return LocalDateTime.of(request.getBookingDate(), request.getStartTime());
    }

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer", qualifiedByName = "getFullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "customerPhone", source = "customer.phone")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "staffName", source = "staff", qualifiedByName = "getFullName")
    @Mapping(target = "statusDescription", source = "status", qualifiedByName = "getStatusDescription")
    @Mapping(target = "services", source = "services", qualifiedByName = "toServiceDetails")
    @Mapping(target = "bookingDate", source = "appointmentTime", qualifiedByName = "getBookingDate")
    @Mapping(target = "startTime", source = "appointmentTime", qualifiedByName = "getStartTime")
    @Mapping(target = "endTime", source = "appointmentTime", qualifiedByName = "getEndTime")
    @Mapping(target = "formattedDateTime", source = "appointmentTime", qualifiedByName = "formatDateTime")
    @Mapping(target = "canCancel", source = "status", qualifiedByName = "canCancelBooking")
    public abstract BookingResponse toBookingResponse(Booking booking);

    @Mapping(target = "id", source = "bookingId")
    @Mapping(target = "customer", source = "customerId", qualifiedByName = "findUserById")
    @Mapping(target = "staff", source = "staffId", qualifiedByName = "findUserById")
    @Mapping(target = "services", source = "serviceIds", qualifiedByName = "findServicesByIds")
    @Mapping(target = "appointmentTime", expression = "java(createAppointmentTimeFromUpdateMethod(request))")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(LocalDateTime.now())")
    public abstract Booking toBooking(UpdateBookingRequest request);

    protected LocalDateTime createAppointmentTimeFromUpdateMethod(UpdateBookingRequest request) {
        if (request.getBookingDate() == null || request.getStartTime() == null) {
            return null;
        }
        return LocalDateTime.of(request.getBookingDate(), request.getStartTime());
    }

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer", qualifiedByName = "getFullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "customerPhone", source = "customer.phone")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "staffName", source = "staff", qualifiedByName = "getFullName")
    @Mapping(target = "statusDescription", source = "status", qualifiedByName = "getStatusDescription")
    @Mapping(target = "services", source = "services", qualifiedByName = "toServiceDetails")
    @Mapping(target = "bookingDate", source = "appointmentTime", qualifiedByName = "getBookingDate")
    @Mapping(target = "startTime", source = "appointmentTime", qualifiedByName = "getStartTime")
    @Mapping(target = "endTime", source = "appointmentTime", qualifiedByName = "getEndTime")
    @Mapping(target = "formattedDateTime", source = "appointmentTime", qualifiedByName = "formatDateTime")
    @Mapping(target = "canCancel", source = "status", qualifiedByName = "canCancelBooking")
    @Mapping(target = "updatedBy", source = "customer.id")
    @Mapping(target = "updatedAt", source = "updatedAt")
    @Mapping(target = "updateNotes", source = "notes")
    public abstract UpdateBookingResponse toUpdateBookingResponse(Booking booking);

    public List<BookingResponse> toBookingResponses(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    @Named("findUserById")
    protected User findUserById(UUID id) {
        if (id == null) {
            return null;
        }
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
        if (user == null) {
            return null;
        }
        return user.getFirstName() + " " + user.getLastName();
    }

    @Named("getStatusDescription")
    protected String getStatusDescription(BookingStatus status) {
        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case COMPLETED -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
            case NO_SHOW -> "Không đến";
        };
    }

    @Named("toServiceDetails")
    protected Set<BookingResponse.ServiceDetail> toServiceDetails(Set<Service> services) {
        return services.stream()
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
    @Mapping(target = "staff", source = "staffId", qualifiedByName = "findUserById")
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "appointmentTime", expression = "java(createAppointmentTimeForUpdateMethod(request))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void updateBooking(@MappingTarget Booking booking, BookingRequest request);

    protected LocalDateTime createAppointmentTimeForUpdateMethod(BookingRequest request) {
        if (request.getBookingDate() == null || request.getStartTime() == null) {
            return null;
        }
        return LocalDateTime.of(request.getBookingDate(), request.getStartTime());
    }
}