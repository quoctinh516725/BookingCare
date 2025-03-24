package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.TreatmentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentResultRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.dto.response.TreatmentResponse;
import com.dailycodework.beautifulcare.dto.response.TreatmentResultResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.Treatment;
import com.dailycodework.beautifulcare.entity.TreatmentResult;
import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.SpecialistRepository;
import com.dailycodework.beautifulcare.repository.TreatmentRepository;
import com.dailycodework.beautifulcare.repository.TreatmentResultRepository;
import com.dailycodework.beautifulcare.service.TreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the TreatmentService interface.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class TreatmentServiceImpl implements TreatmentService {

        private final TreatmentRepository treatmentRepository;
        private final TreatmentResultRepository treatmentResultRepository;
        private final BookingRepository bookingRepository;
        private final SpecialistRepository specialistRepository;
        private final ServiceRepository serviceRepository;

        @Override
        @Transactional
        public TreatmentResponse createTreatment(TreatmentCreateRequest request) {
                // Fetch the booking
                Booking booking = bookingRepository.findById(request.getBookingId())
                                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

                // Fetch the specialist
                Specialist specialist = specialistRepository.findById(request.getSpecialistId())
                                .orElseThrow(() -> new AppException(ErrorCode.SPECIALIST_NOT_FOUND));

                // Fetch the services
                List<Service> services = request.getServiceIds().stream()
                                .map(serviceId -> serviceRepository.findById(serviceId)
                                                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_FOUND)))
                                .collect(Collectors.toList());

                // Create and save the treatment
                Treatment treatment = Treatment.builder()
                                .booking(booking)
                                .specialist(specialist)
                                .notes(request.getNote())
                                .status(TreatmentStatus.SCHEDULED)
                                .services(services)
                                .build();

                Treatment savedTreatment = treatmentRepository.save(treatment);
                return mapToTreatmentResponse(savedTreatment);
        }

        @Override
        public List<TreatmentResponse> getAllTreatments(String bookingId, String specialistId) {
                List<Treatment> treatments;

                if (bookingId != null && specialistId != null) {
                        treatments = treatmentRepository.findAll().stream()
                                        .filter(t -> t.getBooking().getId().equals(bookingId)
                                                        && t.getSpecialist().getId().equals(specialistId))
                                        .collect(Collectors.toList());
                } else if (bookingId != null) {
                        treatments = treatmentRepository.findByBookingId(bookingId);
                } else if (specialistId != null) {
                        treatments = treatmentRepository.findBySpecialistId(specialistId);
                } else {
                        treatments = treatmentRepository.findAll();
                }

                return treatments.stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public TreatmentResponse getTreatmentById(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));
                return mapToTreatmentResponse(treatment);
        }

        @Override
        @Transactional
        public TreatmentResponse updateTreatment(String id, TreatmentUpdateRequest request) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                // Update specialist if provided
                if (request.getSpecialistId() != null) {
                        Specialist specialist = specialistRepository.findById(request.getSpecialistId())
                                        .orElseThrow(() -> new AppException(ErrorCode.SPECIALIST_NOT_FOUND));
                        treatment.setSpecialist(specialist);
                }

                // Update note if provided
                if (request.getNote() != null) {
                        treatment.setNotes(request.getNote());
                }

                // Update status if provided
                if (request.getStatus() != null) {
                        treatment.setStatus(request.getStatus());
                }

                // Update services if provided
                if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
                        List<Service> services = request.getServiceIds().stream()
                                        .map(serviceId -> serviceRepository.findById(serviceId)
                                                        .orElseThrow(() -> new AppException(
                                                                        ErrorCode.SERVICE_NOT_FOUND)))
                                        .collect(Collectors.toList());
                        treatment.setServices(services);
                }

                Treatment updatedTreatment = treatmentRepository.save(treatment);
                return mapToTreatmentResponse(updatedTreatment);
        }

        @Override
        @Transactional
        public TreatmentResponse startTreatment(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                if (treatment.getStatus() != TreatmentStatus.SCHEDULED) {
                        throw new AppException(ErrorCode.TREATMENT_INVALID_STATUS);
                }

                treatment.start();
                Treatment updatedTreatment = treatmentRepository.save(treatment);
                return mapToTreatmentResponse(updatedTreatment);
        }

        @Override
        @Transactional
        public TreatmentResponse completeTreatment(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                if (treatment.getStatus() != TreatmentStatus.IN_PROGRESS) {
                        throw new AppException(ErrorCode.TREATMENT_INVALID_STATUS);
                }

                treatment.complete();
                Treatment updatedTreatment = treatmentRepository.save(treatment);
                return mapToTreatmentResponse(updatedTreatment);
        }

        @Override
        @Transactional
        public TreatmentResultResponse addTreatmentResult(String id, TreatmentResultRequest request) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                // Check if result already exists
                if (treatmentResultRepository.existsByTreatmentId(id)) {
                        throw new AppException(ErrorCode.TREATMENT_RESULT_EXISTS);
                }

                // Create and save the treatment result
                TreatmentResult result = TreatmentResult.builder()
                                .treatment(treatment)
                                .description(request.getDescription())
                                .recommendations(request.getRecommendations())
                                .imageUrls(request.getImageUrls())
                                .productRecommendations(request.getProductRecommendations())
                                .build();

                TreatmentResult savedResult = treatmentResultRepository.save(result);
                return mapToTreatmentResultResponse(savedResult);
        }

        @Override
        public TreatmentResultResponse getTreatmentResult(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                TreatmentResult result = treatmentResultRepository.findByTreatmentId(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_RESULT_NOT_FOUND));

                return mapToTreatmentResultResponse(result);
        }

        @Override
        public List<TreatmentResponse> getTreatmentsBySpecialistId(String specialistId) {
                return treatmentRepository.findBySpecialistId(specialistId).stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TreatmentResponse> getTreatmentsBySpecialistIdAndDateRange(String specialistId,
                        LocalDateTime startDate, LocalDateTime endDate) {
                return treatmentRepository.findBySpecialistIdAndCreatedAtBetween(specialistId, startDate, endDate)
                                .stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TreatmentResponse> getTreatmentsByStatus(TreatmentStatus status) {
                return treatmentRepository.findByStatus(status).stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TreatmentResponse> getTreatmentsByBookingId(String bookingId) {
                return treatmentRepository.findByBookingId(bookingId).stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<TreatmentResponse> getTreatmentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
                return treatmentRepository.findByCreatedAtBetween(startDate, endDate).stream()
                                .map(this::mapToTreatmentResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public TreatmentResponse getLatestTreatmentByBookingId(String bookingId) {
                Treatment treatment = treatmentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));
                return mapToTreatmentResponse(treatment);
        }

        @Override
        @Transactional
        public TreatmentResponse cancelTreatment(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));

                if (treatment.getStatus() == TreatmentStatus.COMPLETED ||
                                treatment.getStatus() == TreatmentStatus.IN_PROGRESS) {
                        throw new AppException(ErrorCode.TREATMENT_CANNOT_BE_CANCELLED);
                }

                treatment.cancel();
                Treatment updatedTreatment = treatmentRepository.save(treatment);
                return mapToTreatmentResponse(updatedTreatment);
        }

        @Override
        @Transactional
        public void deleteTreatment(String id) {
                Treatment treatment = treatmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.TREATMENT_NOT_FOUND));
                treatmentRepository.delete(treatment);
        }

        private TreatmentResponse mapToTreatmentResponse(Treatment treatment) {
                // Map services to service responses
                List<ServiceResponse> serviceResponses = treatment.getServices().stream()
                                .map(service -> ServiceResponse.builder()
                                                .id(service.getId())
                                                .name(service.getName())
                                                .description(service.getDescription())
                                                .price(service.getPrice())
                                                .durationMinutes(service.getDuration())
                                                .imageUrl(service.getImageUrl())
                                                .categoryId(service.getCategory().getId())
                                                .categoryName(service.getCategory().getName())
                                                .createdAt(service.getCreatedAt())
                                                .updatedAt(service.getUpdatedAt())
                                                .build())
                                .collect(Collectors.toList());

                return TreatmentResponse.builder()
                                .id(treatment.getId())
                                .bookingId(treatment.getBooking().getId())
                                .customerId(treatment.getBooking().getCustomer().getId())
                                .customerName(treatment.getBooking().getCustomer().getFirstName() + " "
                                                + treatment.getBooking().getCustomer().getLastName())
                                .specialistId(treatment.getSpecialist().getId())
                                .specialistName(treatment.getSpecialist().getFirstName() + " "
                                                + treatment.getSpecialist().getLastName())
                                .createdAt(treatment.getCreatedAt())
                                .startedAt(treatment.getStartTime())
                                .completedAt(treatment.getEndTime())
                                .status(treatment.getStatus())
                                .note(treatment.getNotes())
                                .services(serviceResponses)
                                .hasResults(treatmentResultRepository.existsByTreatmentId(treatment.getId()))
                                .build();
        }

        private TreatmentResultResponse mapToTreatmentResultResponse(TreatmentResult result) {
                return TreatmentResultResponse.builder()
                                .id(result.getId())
                                .treatmentId(result.getTreatment().getId())
                                .specialistId(result.getTreatment().getSpecialist().getId())
                                .specialistName(result.getTreatment().getSpecialist().getFirstName() + " "
                                                + result.getTreatment().getSpecialist().getLastName())
                                .createdAt(result.getCreatedAt())
                                .description(result.getDescription())
                                .recommendations(result.getRecommendations())
                                .imageUrls(result.getImageUrls())
                                .productRecommendations(result.getProductRecommendations())
                                .build();
        }
}