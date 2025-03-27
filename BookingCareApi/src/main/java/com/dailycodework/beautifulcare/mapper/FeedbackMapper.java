package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.FeedbackRequest;
import com.dailycodework.beautifulcare.dto.response.FeedbackResponse;
import com.dailycodework.beautifulcare.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "comment", source = "comment")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Feedback toFeedback(FeedbackRequest request);

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(feedback.getCustomer().getFirstName() + \" \" + feedback.getCustomer().getLastName())")
    FeedbackResponse toFeedbackResponse(Feedback feedback);

    List<FeedbackResponse> toFeedbackResponses(List<Feedback> feedbacks);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "comment", source = "comment")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFeedback(@MappingTarget Feedback feedback, FeedbackRequest request);
}