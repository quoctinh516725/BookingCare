package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.request.UserRequest;
import com.dailycodework.beautifulcare.dto.response.UserResponse;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", constant = "CUSTOMER")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(RegisterRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", source = "role", defaultValue = "CUSTOMER")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(UserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUser(@MappingTarget User user, UserRequest request);

    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "phoneNumber", source = "phone")
    @Mapping(target = "username", expression = "java(user.getUsernameValue())")
    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponses(List<User> users);
}
