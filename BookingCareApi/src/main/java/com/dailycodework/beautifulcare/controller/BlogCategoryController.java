package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.BlogCategoryDTO;
import com.dailycodework.beautifulcare.dto.BlogCategoryRequest;
import com.dailycodework.beautifulcare.dto.BlogDTO;
import com.dailycodework.beautifulcare.entity.CategoryStatus;
import com.dailycodework.beautifulcare.service.BlogCategoryService;
import com.dailycodework.beautifulcare.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for managing blog categories
 */
@RestController
@RequestMapping("/api/v1/blog-categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Blog Categories", description = "API cho quản lý danh mục blog")
public class BlogCategoryController {
    
    private final BlogCategoryService categoryService;
    private final BlogService blogService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả danh mục blog")
    public ResponseEntity<List<BlogCategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách danh mục blog đang hoạt động")
    public ResponseEntity<List<BlogCategoryDTO>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getCategoriesByStatus(CategoryStatus.ACTIVE));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin danh mục blog theo ID")
    public ResponseEntity<BlogCategoryDTO> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Lấy thông tin danh mục blog theo slug")
    public ResponseEntity<BlogCategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }
    
    @GetMapping("/{id}/blogs")
    @Operation(summary = "Lấy danh sách bài viết trong danh mục")
    public ResponseEntity<List<BlogDTO>> getBlogsByCategory(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.getBlogsByCategory(id));
    }
    
    @GetMapping("/{id}/has-blogs")
    @Operation(summary = "Kiểm tra danh mục có bài viết hay không")
    public ResponseEntity<Boolean> categoryHasBlogs(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.categoryHasBlogs(id));
    }
    
    @GetMapping("/{id}/count-blogs")
    @Operation(summary = "Đếm số bài viết trong danh mục")
    public ResponseEntity<Long> countBlogsByCategory(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.countBlogsByCategory(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo danh mục blog mới")
    public ResponseEntity<BlogCategoryDTO> createCategory(@Valid @RequestBody BlogCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật danh mục blog")
    public ResponseEntity<BlogCategoryDTO> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody BlogCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa danh mục blog")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
} 