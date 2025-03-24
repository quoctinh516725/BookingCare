# Beautiful Care API Documentation

## Overview

The Beautiful Care API provides endpoints for managing a beauty salon's services, including user management, appointments, treatments, specialists, blog content, and more. This documentation provides details on available endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are prefixed with: `/api/v1/`

## Authentication

Most endpoints require authentication using JWT (JSON Web Token).

### Authentication Endpoints

#### Register a new user

```
POST /api/v1/auth/register
```

Request body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "string" // Optional, defaults to CUSTOMER
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Login

```
POST /api/v1/auth/login
```

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "string",
    "tokenType": "Bearer"
  }
}
```

## User Management

### Endpoints

#### Get all users

```
GET /api/v1/users
```

Authorization: Required (ADMIN role)

Response:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string"
    }
  ]
}
```

#### Get user by ID

```
GET /api/v1/users/{id}
```

Authorization: Required (ADMIN role or own user)

Response:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Update user

```
PUT /api/v1/users/{id}
```

Authorization: Required (ADMIN role or own user)

Request body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Delete user

```
DELETE /api/v1/users/{id}
```

Authorization: Required (ADMIN role)

Response:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

## Services

### Endpoints

#### Get all services

```
GET /api/v1/services
```

Response:
```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "duration": "number",
      "category": "string"
    }
  ]
}
```

#### Get service by ID

```
GET /api/v1/services/{id}
```

Response:
```json
{
  "success": true,
  "message": "Service retrieved successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "duration": "number",
    "category": "string"
  }
}
```

#### Create service

```
POST /api/v1/services
```

Authorization: Required (ADMIN role)

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "duration": "number",
  "categoryId": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "duration": "number",
    "category": "string"
  }
}
```

#### Update service

```
PUT /api/v1/services/{id}
```

Authorization: Required (ADMIN role)

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "duration": "number",
  "categoryId": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "duration": "number",
    "category": "string"
  }
}
```

#### Delete service

```
DELETE /api/v1/services/{id}
```

Authorization: Required (ADMIN role)

Response:
```json
{
  "success": true,
  "message": "Service deleted successfully",
  "data": null
}
```

## Specialists

### Endpoints

#### Get all specialists

```
GET /api/v1/specialists
```

Response:
```json
{
  "success": true,
  "message": "Specialists retrieved successfully",
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "specialization": "string",
      "bio": "string",
      "photoUrl": "string"
    }
  ]
}
```

#### Get specialist by ID

```
GET /api/v1/specialists/{id}
```

Response:
```json
{
  "success": true,
  "message": "Specialist retrieved successfully",
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "specialization": "string",
    "bio": "string",
    "photoUrl": "string"
  }
}
```

#### Create specialist

```
POST /api/v1/specialists
```

Authorization: Required (ADMIN role)

Request body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "specialization": "string",
  "bio": "string",
  "photoUrl": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Specialist created successfully",
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "specialization": "string",
    "bio": "string",
    "photoUrl": "string"
  }
}
```

## Bookings

### Endpoints

#### Get all bookings

```
GET /api/v1/bookings
```

Authorization: Required (ADMIN role)

Response:
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "string",
      "customer": { /* customer object */ },
      "specialist": { /* specialist object */ },
      "service": { /* service object */ },
      "startTime": "datetime",
      "endTime": "datetime",
      "status": "string",
      "notes": "string"
    }
  ]
}
```

#### Get booking by ID

```
GET /api/v1/bookings/{id}
```

Authorization: Required (ADMIN role or booking owner)

Response:
```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "id": "string",
    "customer": { /* customer object */ },
    "specialist": { /* specialist object */ },
    "service": { /* service object */ },
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "string",
    "notes": "string"
  }
}
```

#### Create booking

```
POST /api/v1/bookings
```

Authorization: Required

Request body:
```json
{
  "customerId": "string",
  "specialistId": "string",
  "serviceId": "string",
  "startTime": "datetime",
  "notes": "string"
}
```

Response:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "string",
    "customer": { /* customer object */ },
    "specialist": { /* specialist object */ },
    "service": { /* service object */ },
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "PENDING",
    "notes": "string"
  }
}
```

#### Update booking status

```
PATCH /api/v1/bookings/{id}/status
```

Authorization: Required (ADMIN role)

Request body:
```json
{
  "status": "string" // CONFIRMED, COMPLETED, CANCELLED
}
```

Response:
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "string",
    "status": "string"
  }
}
```

## Blog

### Blog Categories

#### Get all blog categories

```
GET /api/v1/blog-categories
```

Response:
```json
{
  "success": true,
  "message": "Blog categories retrieved successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

#### Get blog category by ID

```
GET /api/v1/blog-categories/{id}
```

Response:
```json
{
  "success": true,
  "message": "Blog category retrieved successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### Create blog category

```
POST /api/v1/blog-categories
```

Authorization: Required (ADMIN role)

Request parameters:
```
name: string (required)
description: string (optional)
```

Response:
```json
{
  "success": true,
  "message": "Blog category created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### Blog Posts

#### Get all blog posts

```
GET /api/v1/blogs
```

Response:
```json
{
  "success": true,
  "message": "Blog posts retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "imageUrl": "string",
      "slug": "string",
      "published": "boolean",
      "category": { /* category object */ },
      "author": { /* author object */ },
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "publishedAt": "datetime"
    }
  ]
}
```

#### Get published blog posts

```
GET /api/v1/blogs/published
```

Response:
```json
{
  "success": true,
  "message": "Published blog posts retrieved successfully",
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "imageUrl": "string",
      "slug": "string",
      "published": true,
      "category": { /* category object */ },
      "author": { /* author object */ },
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "publishedAt": "datetime"
    }
  ]
}
```

#### Get blog post by ID

```
GET /api/v1/blogs/{id}
```

Response:
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "slug": "string",
    "published": "boolean",
    "category": { /* category object */ },
    "author": { /* author object */ },
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "publishedAt": "datetime"
  }
}
```

#### Get blog post by slug

```
GET /api/v1/blogs/slug/{slug}
```

Response:
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "slug": "string",
    "published": "boolean",
    "category": { /* category object */ },
    "author": { /* author object */ },
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "publishedAt": "datetime"
  }
}
```

#### Create blog post

```
POST /api/v1/blogs
```

Authorization: Required (ADMIN or CONTENT_CREATOR role)

Request body:
```json
{
  "title": "string",
  "content": "string",
  "imageUrl": "string",
  "categoryId": "string",
  "published": "boolean"
}
```

Request parameters:
```
authorId: string (required)
```

Response:
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "slug": "string",
    "published": "boolean",
    "category": { /* category object */ },
    "author": { /* author object */ },
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "publishedAt": "datetime"
  }
}
```

#### Update blog post

```
PUT /api/v1/blogs/{id}
```

Authorization: Required (ADMIN or CONTENT_CREATOR role)

Request body:
```json
{
  "title": "string",
  "content": "string",
  "imageUrl": "string",
  "categoryId": "string",
  "published": "boolean"
}
```

Response:
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "slug": "string",
    "published": "boolean",
    "category": { /* category object */ },
    "author": { /* author object */ },
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "publishedAt": "datetime"
  }
}
```

#### Publish blog post

```
PATCH /api/v1/blogs/{id}/publish
```

Authorization: Required (ADMIN or CONTENT_CREATOR role)

Response:
```json
{
  "success": true,
  "message": "Blog post published successfully",
  "data": {
    "id": "string",
    "published": true,
    "publishedAt": "datetime"
  }
}
```

#### Delete blog post

```
DELETE /api/v1/blogs/{id}
```

Authorization: Required (ADMIN or CONTENT_CREATOR role)

Response:
```json
{
  "success": true,
  "message": "Blog post deleted successfully",
  "data": null
}
```

## Error Responses

All API endpoints return standardized error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "data": null
}
```

Common HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be processed
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource doesn't exist
- `409 Conflict`: The request conflicts with the current state (e.g., duplicate resource)
- `500 Internal Server Error`: An unexpected error occurred on the server 