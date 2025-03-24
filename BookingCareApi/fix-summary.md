# User Controller Fix Summary

## Problem Identified
The user controller was failing with the error "Column 'role' cannot be null" when attempting to create new users via the `/api/v1/users` endpoint. This was happening because:

1. The User entity has a required `role` field that cannot be null in the database
2. The UserCreateRequest DTO didn't include a role field
3. The mapper wasn't setting any default role
4. The UserService.createUser() method wasn't setting the role before saving

## Solution Implemented
We've fixed the issue by updating the UserService.createUser() method to set a default role of CUSTOMER for all users created through this endpoint:

```java
@Transactional
public UserResponse createUser(UserCreateRequest request) {
    // existing validation code...
    
    User newUser = userMapper.toUser(request);
    newUser.setPassword(passwordEncoder.encode(request.getPassword()));
    newUser.setActive(true);
    newUser.setRole(UserRole.CUSTOMER); // Added this line to set default role
    
    User savedUser = userRepository.save(newUser);
    return userMapper.toUserResponse(savedUser);
}
```

This approach:
1. Provides a secure default where all users created through the API are given the basic CUSTOMER role
2. Doesn't require exposing role selection to API clients, which could be a security risk
3. Makes the API easier to use by not requiring an additional field

## Testing the Fix
You can test this fix by sending a POST request to the `/api/v1/users` endpoint with valid user data:

```
POST /api/v1/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "phone": "1234567890"
}
```

The response should be successful, and the user should be created with the CUSTOMER role.

## Additional Considerations
1. The CustomerServiceImpl was already correctly setting the role to CUSTOMER, so no changes were needed there.
2. If in the future you need admin users to be able to create users with different roles, you should:
   - Create a separate DTO like AdminUserCreateRequest that includes a role field
   - Create a separate endpoint like `/api/v1/admin/users` that accepts this request
   - Secure this endpoint with appropriate authorization to ensure only admins can access it

This way, you maintain the security of your system by not allowing regular users to create accounts with elevated privileges. 