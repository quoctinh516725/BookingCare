package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.SkinTestCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SkinTestResultRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceRecommendationResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;
import com.dailycodework.beautifulcare.entity.Customer;
import com.dailycodework.beautifulcare.entity.SkinTest;
import com.dailycodework.beautifulcare.entity.SkinTestResult;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.repository.CustomerRepository;
import com.dailycodework.beautifulcare.repository.SkinTestRepository;
import com.dailycodework.beautifulcare.repository.SkinTestResultRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.SkinTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkinTestServiceImpl implements SkinTestService {

    private final SkinTestRepository skinTestRepository;
    private final SkinTestResultRepository skinTestResultRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public SkinTestResponse createSkinTest(SkinTestCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        SkinTest skinTest = SkinTest.builder()
                .user(user)
                .skinType(request.getSkinType())
                .skinCondition(request.getSkinCondition())
                .allergies(request.getAllergies() != null ? String.join(", ", request.getAllergies()) : null)
                .medications(request.getMedications() != null ? String.join(", ", request.getMedications()) : null)
                .notes(request.getNotes())
                .testDate(request.getTestDate())
                .build();

        SkinTest savedSkinTest = skinTestRepository.save(skinTest);
        return mapToSkinTestResponse(savedSkinTest);
    }

    @Override
    public List<SkinTestResponse> getAllSkinTests(Boolean active) {
        List<SkinTest> skinTests;
        if (active != null) {
            skinTests = skinTestRepository.findByActive(active);
        } else {
            skinTests = skinTestRepository.findAll();
        }
        return skinTests.stream()
                .map(this::mapToSkinTestResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SkinTestResponse getSkinTestById(String id) {
        SkinTest skinTest = skinTestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_NOT_FOUND));
        return mapToSkinTestResponse(skinTest);
    }

    @Override
    public List<SkinTestResponse> getSkinTestsByUserId(String userId) {
        return skinTestRepository.findByUserId(userId).stream()
                .map(this::mapToSkinTestResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SkinTestResponse getLatestSkinTestByUserId(String userId) {
        SkinTest skinTest = skinTestRepository.findFirstByUserIdOrderByTestDateDesc(userId)
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_NOT_FOUND));
        return mapToSkinTestResponse(skinTest);
    }

    @Override
    public List<SkinTestResponse> getSkinTestsByUserIdAndDateRange(String userId, LocalDateTime startDate,
            LocalDateTime endDate) {
        return skinTestRepository.findByUserIdAndTestDateBetween(userId, startDate, endDate).stream()
                .map(this::mapToSkinTestResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SkinTestResponse updateSkinTest(String id, SkinTestCreateRequest request) {
        SkinTest skinTest = skinTestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_NOT_FOUND));

        if (request.getSkinType() != null) {
            skinTest.setSkinType(request.getSkinType());
        }

        if (request.getSkinCondition() != null) {
            skinTest.setSkinCondition(request.getSkinCondition());
        }

        if (request.getAllergies() != null) {
            skinTest.setAllergies(String.join(", ", request.getAllergies()));
        }

        if (request.getMedications() != null) {
            skinTest.setMedications(String.join(", ", request.getMedications()));
        }

        if (request.getNotes() != null) {
            skinTest.setNotes(request.getNotes());
        }

        if (request.getTestDate() != null) {
            skinTest.setTestDate(request.getTestDate());
        }

        SkinTest updatedSkinTest = skinTestRepository.save(skinTest);
        return mapToSkinTestResponse(updatedSkinTest);
    }

    @Override
    @Transactional
    public void deleteSkinTest(String id) {
        if (!skinTestRepository.existsById(id)) {
            throw new AppException(ErrorCode.SKIN_TEST_NOT_FOUND);
        }
        skinTestRepository.deleteById(id);
    }

    @Override
    @Transactional
    public SkinTestResultResponse saveSkinTestResult(SkinTestResultRequest request) {
        SkinTest skinTest = skinTestRepository.findById(request.getSkinTestId())
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_NOT_FOUND));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        SkinTestResult result = new SkinTestResult();
        result.setSkinTest(skinTest);
        result.setCustomer(customer);
        result.setAnswers(request.getAnswers());
        result.setCreatedAt(LocalDateTime.now());

        SkinTestResult savedResult = skinTestResultRepository.save(result);
        return mapToSkinTestResultResponse(savedResult);
    }

    @Override
    public SkinTestResultResponse getSkinTestResultById(String id) {
        SkinTestResult result = skinTestResultRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_RESULT_NOT_FOUND));
        return mapToSkinTestResultResponse(result);
    }

    @Override
    public List<ServiceRecommendationResponse> getServiceRecommendations(String resultId) {
        SkinTestResult result = skinTestResultRepository.findById(resultId)
                .orElseThrow(() -> new AppException(ErrorCode.SKIN_TEST_RESULT_NOT_FOUND));

        // TODO: Implement service recommendation logic based on skin test results
        return List.of();
    }

    @Override
    public List<SkinTestResultResponse> getCustomerSkinTestResults(String customerId) {
        return skinTestResultRepository.findBySkinTestUserId(customerId).stream()
                .map(this::mapToSkinTestResultResponse)
                .collect(Collectors.toList());
    }

    private SkinTestResponse mapToSkinTestResponse(SkinTest skinTest) {
        return SkinTestResponse.builder()
                .id(skinTest.getId())
                .userId(skinTest.getUser().getId())
                .skinType(skinTest.getSkinType())
                .skinCondition(skinTest.getSkinCondition())
                .allergies(skinTest.getAllergies() != null ? Arrays.asList(skinTest.getAllergies().split(", ")) : null)
                .medications(
                        skinTest.getMedications() != null ? Arrays.asList(skinTest.getMedications().split(", ")) : null)
                .notes(skinTest.getNotes())
                .testDate(skinTest.getTestDate())
                .createdAt(skinTest.getCreatedAt())
                .updatedAt(skinTest.getUpdatedAt())
                .build();
    }

    private SkinTestResultResponse mapToSkinTestResultResponse(SkinTestResult result) {
        return SkinTestResultResponse.builder()
                .id(result.getId())
                .skinTestId(result.getSkinTest().getId())
                .customerId(result.getCustomer().getId())
                .answers(result.getAnswers())
                .createdAt(result.getCreatedAt())
                .build();
    }
}