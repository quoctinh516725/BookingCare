package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.BlogCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BlogResponse;
import com.dailycodework.beautifulcare.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blogs")
@RequiredArgsConstructor
@Tag(name = "Blog Management", description = "APIs for managing blog posts")
public class BlogController {
    private final BlogService blogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONTENT_CREATOR')")
    @Operation(summary = "Create a new blog post", description = "Create a new blog post. Requires ADMIN or CONTENT_CREATOR role.")
    public ResponseEntity<BlogResponse> createBlog(
            @RequestBody @Valid BlogCreateRequest request,
            @Parameter(description = "Author ID") @RequestParam String authorId) {
        return new ResponseEntity<>(blogService.createBlog(request, authorId), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a blog post by ID", description = "Retrieve a blog post by its ID")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable String id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get a blog post by slug", description = "Retrieve a blog post by its URL slug")
    public ResponseEntity<BlogResponse> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug));
    }

    @GetMapping
    @Operation(summary = "Get all blog posts", description = "Retrieve all blog posts")
    public ResponseEntity<List<BlogResponse>> getAllBlogs() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get blog posts by category", description = "Retrieve all blog posts in a specific category")
    public ResponseEntity<List<BlogResponse>> getBlogsByCategory(@PathVariable String categoryId) {
        return ResponseEntity.ok(blogService.getBlogsByCategory(categoryId));
    }

    @GetMapping("/author/{authorId}")
    @Operation(summary = "Get blog posts by author", description = "Retrieve all blog posts by a specific author")
    public ResponseEntity<List<BlogResponse>> getBlogsByAuthor(@PathVariable String authorId) {
        return ResponseEntity.ok(blogService.getBlogsByAuthor(authorId));
    }

    @GetMapping("/published")
    @Operation(summary = "Get published blog posts", description = "Retrieve all published blog posts")
    public ResponseEntity<List<BlogResponse>> getPublishedBlogs() {
        return ResponseEntity.ok(blogService.getPublishedBlogs());
    }

    @GetMapping("/search")
    @Operation(summary = "Search blog posts", description = "Search blog posts by keyword")
    public ResponseEntity<List<BlogResponse>> searchBlogs(@RequestParam String keyword) {
        return ResponseEntity.ok(blogService.searchBlogs(keyword));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONTENT_CREATOR')")
    @Operation(summary = "Update a blog post", description = "Update an existing blog post. Requires ADMIN or CONTENT_CREATOR role.")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable String id,
            @RequestBody @Valid BlogCreateRequest request) {
        return ResponseEntity.ok(blogService.updateBlog(id, request));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONTENT_CREATOR')")
    @Operation(summary = "Publish a blog post", description = "Publish an existing blog post. Requires ADMIN or CONTENT_CREATOR role.")
    public ResponseEntity<BlogResponse> publishBlog(@PathVariable String id) {
        return ResponseEntity.ok(blogService.publishBlog(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONTENT_CREATOR')")
    @Operation(summary = "Delete a blog post", description = "Delete a blog post. Requires ADMIN or CONTENT_CREATOR role.")
    public ResponseEntity<Void> deleteBlog(@PathVariable String id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}