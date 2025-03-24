package com.dailycodework.beautifulcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
     String username;
     String id;
     String password;
     String firstName;
     String lastName;
     LocalDate dob;
}
