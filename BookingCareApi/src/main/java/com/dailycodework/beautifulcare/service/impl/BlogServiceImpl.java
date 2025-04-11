package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.BlogDTO;
import com.dailycodework.beautifulcare.dto.BlogRequest;
import com.dailycodework.beautifulcare.entity.Blog;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.BlogStatus;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.BlogMapper;
import com.dailycodework.beautifulcare.repository.BlogCategoryRepository;
import com.dailycodework.beautifulcare.repository.BlogRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.BlogService;
import com.dailycodework.beautifulcare.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of BlogService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final BlogCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BlogMapper blogMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public List<BlogDTO> getAllBlogs() {
        return blogRepository.findAll().stream()
                .map(blogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogDTO> getAllBlogs(Pageable pageable) {
        return blogRepository.findAll(pageable)
                .map(blogMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDTO> getBlogsByStatus(BlogStatus status) {
        return blogRepository.findByStatus(status).stream()
                .map(blogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogDTO> getBlogsByStatus(BlogStatus status, Pageable pageable) {
        return blogRepository.findByStatus(status, pageable)
                .map(blogMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogDTO getBlogById(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));
        return blogMapper.toDTO(blog);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogDTO getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with slug: " + slug));
        return blogMapper.toDTO(blog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDTO> searchBlogs(String keyword) {
        return blogRepository.searchBlogs(keyword).stream()
                .map(blogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogDTO> searchBlogs(String keyword, Pageable pageable) {
        return blogRepository.searchBlogs(keyword, pageable)
                .map(blogMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDTO> getBlogsByCategory(UUID categoryId) {
        BlogCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return blogRepository.findByCategory(category).stream()
                .map(blogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogDTO> getBlogsByCategory(UUID categoryId, Pageable pageable) {
        BlogCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return blogRepository.findByCategory(category, pageable)
                .map(blogMapper::toDTO);
    }

    @Override
    @Transactional
    public BlogDTO createBlog(BlogRequest request) {
        // Lấy thông tin người dùng hiện tại
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        // Lấy thông tin danh mục
        BlogCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        
        // Tạo slug nếu chưa có
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = SlugUtils.createSlug(request.getTitle());
        }
        
        // Đảm bảo slug là duy nhất
        slug = ensureUniqueSlug(slug, null);
        
        // Tạo entity mới
        Blog blog = Blog.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(request.getExcerpt())
                .slug(slug)
                .category(category)
                .author(currentUser)
                .thumbnailUrl(request.getThumbnailUrl())
                .status(request.getStatus() != null ? request.getStatus() : BlogStatus.DRAFT)
                .build();
        
        // Lưu vào database
        Blog savedBlog = blogRepository.save(blog);
        log.info("Created new blog: {}", savedBlog.getTitle());
        
        return blogMapper.toDTO(savedBlog);
    }

    @Override
    @Transactional
    public BlogDTO updateBlog(UUID id, BlogRequest request) {
        // Tìm blog cần cập nhật
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id: " + id));
        
        // Cập nhật danh mục nếu có thay đổi
        if (request.getCategoryId() != null && !request.getCategoryId().equals(blog.getCategory().getId())) {
            BlogCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            blog.setCategory(category);
        }
        
        // Cập nhật slug nếu tiêu đề thay đổi
        if (request.getSlug() != null && !request.getSlug().isEmpty()) {
            String slug = ensureUniqueSlug(request.getSlug(), id);
            blog.setSlug(slug);
        } else if (request.getTitle() != null && !request.getTitle().equals(blog.getTitle())) {
            String slug = ensureUniqueSlug(SlugUtils.createSlug(request.getTitle()), id);
            blog.setSlug(slug);
        }
        
        // Cập nhật các trường khác
        if (request.getTitle() != null) blog.setTitle(request.getTitle());
        if (request.getContent() != null) blog.setContent(request.getContent());
        if (request.getExcerpt() != null) blog.setExcerpt(request.getExcerpt());
        if (request.getThumbnailUrl() != null) blog.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getStatus() != null) blog.setStatus(request.getStatus());
        
        // Lưu vào database
        Blog updatedBlog = blogRepository.save(blog);
        log.info("Updated blog with id {}: {}", id, updatedBlog.getTitle());
        
        return blogMapper.toDTO(updatedBlog);
    }

    @Override
    @Transactional
    public void deleteBlog(UUID id) {
        if (!blogRepository.existsById(id)) {
            throw new ResourceNotFoundException("Blog not found with id: " + id);
        }
        
        blogRepository.deleteById(id);
        log.info("Deleted blog with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countBlogsByStatus(BlogStatus status) {
        return blogRepository.countByStatus(status);
    }
    
    /**
     * Đảm bảo slug là duy nhất
     * @param slug Slug ban đầu
     * @param blogId ID của bài viết cần bỏ qua khi kiểm tra (dùng cho cập nhật)
     * @return Slug đã đảm bảo duy nhất
     */
    private String ensureUniqueSlug(String slug, UUID blogId) {
        String finalSlug = slug;
        int counter = 1;
        
        while (blogId == null ? 
                blogRepository.existsBySlug(finalSlug) : 
                blogRepository.existsBySlugAndIdNot(finalSlug, blogId)) {
            finalSlug = slug + "-" + counter++;
        }
        
        return finalSlug;
    }
} 