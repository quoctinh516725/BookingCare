package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.BlogDTO;
import com.dailycodework.beautifulcare.dto.BlogRequest;
import com.dailycodework.beautifulcare.entity.BlogStatus;
import com.dailycodework.beautifulcare.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for managing blog posts
 */
@RestController
@RequestMapping("/api/v1/blogs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Blogs", description = "API cho quản lý blog")
public class BlogController {
    
    private final BlogService blogService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả bài viết blog")
    public ResponseEntity<List<BlogDTO>> getAllBlogs() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }
    
    @GetMapping("/paged")
    @Operation(summary = "Lấy danh sách bài viết blog với phân trang")
    public ResponseEntity<Page<BlogDTO>> getPagedBlogs(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(blogService.getAllBlogs(pageable));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách bài viết blog theo trạng thái")
    public ResponseEntity<List<BlogDTO>> getBlogsByStatus(@PathVariable BlogStatus status) {
        return ResponseEntity.ok(blogService.getBlogsByStatus(status));
    }
    
    @GetMapping("/status/{status}/paged")
    @Operation(summary = "Lấy danh sách bài viết blog theo trạng thái với phân trang")
    public ResponseEntity<Page<BlogDTO>> getPagedBlogsByStatus(
            @PathVariable BlogStatus status,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(blogService.getBlogsByStatus(status, pageable));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin bài viết blog theo ID")
    public ResponseEntity<BlogDTO> getBlogById(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Lấy thông tin bài viết blog theo slug")
    public ResponseEntity<BlogDTO> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm bài viết blog")
    public ResponseEntity<List<BlogDTO>> searchBlogs(@RequestParam String keyword) {
        return ResponseEntity.ok(blogService.searchBlogs(keyword));
    }
    
    @GetMapping("/search/paged")
    @Operation(summary = "Tìm kiếm bài viết blog với phân trang")
    public ResponseEntity<Page<BlogDTO>> searchPagedBlogs(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(blogService.searchBlogs(keyword, pageable));
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Lấy danh sách bài viết blog theo danh mục")
    public ResponseEntity<List<BlogDTO>> getBlogsByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(blogService.getBlogsByCategory(categoryId));
    }
    
    @GetMapping("/category/{categoryId}/paged")
    @Operation(summary = "Lấy danh sách bài viết blog theo danh mục với phân trang")
    public ResponseEntity<Page<BlogDTO>> getPagedBlogsByCategory(
            @PathVariable UUID categoryId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(blogService.getBlogsByCategory(categoryId, pageable));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo bài viết blog mới")
    public ResponseEntity<BlogDTO> createBlog(@Valid @RequestBody BlogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.createBlog(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật bài viết blog")
    public ResponseEntity<BlogDTO> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(blogService.updateBlog(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa bài viết blog")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count/status/{status}")
    @Operation(summary = "Lấy số lượng bài viết blog theo trạng thái")
    public ResponseEntity<Long> countBlogsByStatus(@PathVariable BlogStatus status) {
        return ResponseEntity.ok(blogService.countBlogsByStatus(status));
    }
} 