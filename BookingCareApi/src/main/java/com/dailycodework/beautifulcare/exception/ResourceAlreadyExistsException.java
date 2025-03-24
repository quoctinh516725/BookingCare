package com.dailycodework.beautifulcare.exception;

import org.springframework.http.HttpStatus;

public class ResourceAlreadyExistsException extends AppException {
    public ResourceAlreadyExistsException(String message) {
        super(ErrorCode.BLOG_CATEGORY_ALREADY_EXISTS, message);
    }
}