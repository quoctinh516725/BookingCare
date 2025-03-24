# API Consolidation Changes

## Overview

We have consolidated the user management APIs (`UserController`, `AuthenticationController`, and `CustomerController`) into a single, comprehensive `UserManagementController` with a consistent URL structure and versioning. This change improves API organization, reduces duplication, and provides a more intuitive experience for API consumers.

## New Endpoint Structure

### Base URL

All user management operations now use the base URL:
```
/api/v1/users
```

### Authentication Endpoints

| Operation | Old Endpoint | New Endpoint | Description |
|-----------|-------------|-------------|-------------|
| Login | `POST /auth/token` | `POST /api/v1/users/auth/login` | Authenticate a user and get a JWT token |
| Validate Token | `POST /auth/introspect` | `POST /api/v1/users/auth/validate` | Validate a JWT token |

### User Management Endpoints

| Operation | Old Endpoint | New Endpoint | Description |
|-----------|-------------|-------------|-------------|
| Create User | `POST /users` | `POST /api/v1/users` | Create a new user |
| Get All Users | `GET /users` | `GET /api/v1/users` | Retrieve all users |
| Get User by ID | `GET /users/{userId}` | `GET /api/v1/users/{userId}` | Get a specific user by ID |
| Update User | `PUT /users/{userId}` | `PUT /api/v1/users/{userId}` | Update a user's information |
| Delete User | `DELETE /users/{userId}` | `DELETE /api/v1/users/{userId}` | Delete a user |

### Customer Endpoints

| Operation | Old Endpoint | New Endpoint | Description |
|-----------|-------------|-------------|-------------|
| Create Customer | `POST /api/v1/customers` | `POST /api/v1/users/customers` | Create a new customer |
| Get All Customers | `GET /api/v1/customers` | `GET /api/v1/users/customers` | Retrieve all customers |
| Get Customer by ID | `GET /api/v1/customers/{id}` | `GET /api/v1/users/customers/{customerId}` | Get a specific customer by ID |
| Update Customer | `PUT /api/v1/customers/{id}` | `PUT /api/v1/users/customers/{customerId}` | Update customer information |
| Delete Customer | `DELETE /api/v1/customers/{id}` | `DELETE /api/v1/users/customers/{customerId}` | Delete a customer |
| Get Customer Bookings | `GET /api/v1/customers/{id}/bookings` | `GET /api/v1/users/customers/{customerId}/bookings` | Get all bookings for a customer |
| Get Customer Skin Test Results | `GET /api/v1/customers/{id}/skin-test-results` | `GET /api/v1/users/customers/{customerId}/skin-test-results` | Get skin test results for a customer |

## Backward Compatibility

The old endpoints are still available but have been marked as deprecated. They will be removed in a future release. We recommend updating your client applications to use the new endpoint structure as soon as possible.

## Benefits of this Change

1. **Consistent URL Structure**: All user-related endpoints now follow a consistent pattern.
2. **Proper API Versioning**: All endpoints include a version prefix (`/api/v1/`).
3. **Logical Grouping**: Related endpoints are grouped together in a hierarchical structure.
4. **Reduced Duplication**: Consolidation eliminates the need for multiple controllers with similar functionality.
5. **Improved Discoverability**: The API structure is more intuitive and easier to navigate.
6. **Better Documentation**: OpenAPI/Swagger annotations have been added to improve API documentation.

## Implementation Details

The new `UserManagementController` integrates the functionality from three separate controllers while maintaining the same service layer implementation. No changes were made to the underlying business logic or data access code. 