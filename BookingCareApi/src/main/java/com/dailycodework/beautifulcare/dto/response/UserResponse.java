package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
     private UUID id;
     private String username;
     private String firstName;
     private String lastName;
     private String fullName;
     private String email;
     private String phoneNumber;
     private UserRole role;
     private String description;
     private LocalDateTime createdAt;
     private LocalDateTime updatedAt;
}
