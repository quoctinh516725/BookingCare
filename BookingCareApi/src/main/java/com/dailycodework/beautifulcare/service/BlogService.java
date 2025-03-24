package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.BlogCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BlogResponse;

import java.util.List;

public interface BlogService {
    BlogResponse createBlog(BlogCreateRequest request, String authorId);

    BlogResponse getBlogById(String id);

    BlogResponse getBlogBySlug(String slug);

    List<BlogResponse> getAllBlogs();

    List<BlogResponse> getBlogsByCategory(String categoryId);

    List<BlogResponse> getBlogsByAuthor(String authorId);

    List<BlogResponse> getPublishedBlogs();

    List<BlogResponse> searchBlogs(String keyword);

    BlogResponse updateBlog(String id, BlogCreateRequest request);

    BlogResponse publishBlog(String id);

    void deleteBlog(String id);
}