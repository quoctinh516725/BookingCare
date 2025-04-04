package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
     @Size(min = 8, message = "Password must be at least 8 characters")
     private String password;

     @Email(message = "Email should be valid")
     private String email;

     @Pattern(regexp = "^\\d{10,15}$", message = "Phone number should be valid")
     private String phone;

     private String firstName;
     private String lastName;
     private LocalDate dob;
     
     @Size(max = 1000, message = "Description must be at most 1000 characters")
     private String description;
     
     // Trường để cập nhật vai trò người dùng (ADMIN, STAFF, CUSTOMER)
     private String role;
}
