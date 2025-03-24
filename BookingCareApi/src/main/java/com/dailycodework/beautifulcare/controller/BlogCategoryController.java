package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.response.BlogCategoryResponse;
import com.dailycodework.beautifulcare.service.BlogCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blog-categories")
@RequiredArgsConstructor
@Tag(name = "Blog Category Management", description = "APIs for managing blog categories")
public class BlogCategoryController {
    private final BlogCategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new blog category", description = "Create a new blog category. Requires ADMIN role.")
    public ResponseEntity<BlogCategoryResponse> createCategory(
            @RequestParam @Valid String name,
            @RequestParam(required = false) String description) {
        return new ResponseEntity<>(categoryService.createCategory(name, description), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a blog category by ID", description = "Retrieve a blog category by its ID")
    public ResponseEntity<BlogCategoryResponse> getCategoryById(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get a blog category by name", description = "Retrieve a blog category by its name")
    public ResponseEntity<BlogCategoryResponse> getCategoryByName(@PathVariable String name) {
        return ResponseEntity.ok(categoryService.getCategoryByName(name));
    }

    @GetMapping
    @Operation(summary = "Get all blog categories", description = "Retrieve all blog categories")
    public ResponseEntity<List<BlogCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a blog category", description = "Update an existing blog category. Requires ADMIN role.")
    public ResponseEntity<BlogCategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestParam @Valid String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(categoryService.updateCategory(id, name, description));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a blog category", description = "Delete a blog category. Requires ADMIN role. Will fail if category has blogs.")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/reassign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a blog category and reassign blogs", description = "Delete a blog category and reassign its blogs to another category. Requires ADMIN role.")
    public ResponseEntity<Void> deleteCategoryAndReassignBlogs(
            @PathVariable String id,
            @RequestParam String targetCategoryId) {
        categoryService.deleteCategoryAndReassignBlogs(id, targetCategoryId);
        return ResponseEntity.noContent().build();
    }
}