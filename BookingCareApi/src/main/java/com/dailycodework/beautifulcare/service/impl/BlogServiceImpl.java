package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.BlogCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BlogResponse;
import com.dailycodework.beautifulcare.entity.Blog;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.mapper.BlogMapper;
import com.dailycodework.beautifulcare.repository.BlogCategoryRepository;
import com.dailycodework.beautifulcare.repository.BlogRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.BlogService;
import com.dailycodework.beautifulcare.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogServiceImpl implements BlogService {
        private final BlogRepository blogRepository;
        private final BlogCategoryRepository categoryRepository;
        private final UserRepository userRepository;
        private final BlogMapper blogMapper;

        @Override
        public BlogResponse createBlog(BlogCreateRequest request, String authorId) {
                User author = userRepository.findById(authorId)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,
                                                "User not found with ID: " + authorId));

                BlogCategory category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                                                "Blog category not found with ID: " + request.getCategoryId()));

                Blog blog = blogMapper.toBlog(request);
                blog.setAuthor(author);
                blog.setCategory(category);
                blog.setSlug(SlugUtil.generateSlug(request.getTitle()));
                blog.setCreatedAt(LocalDateTime.now());
                blog.setUpdatedAt(LocalDateTime.now());

                Blog savedBlog = blogRepository.save(blog);
                return blogMapper.toBlogResponse(savedBlog);
        }

        @Override
        public BlogResponse getBlogById(String id) {
                Blog blog = blogRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND,
                                                "Blog not found with ID: " + id));
                return blogMapper.toBlogResponse(blog);
        }

        @Override
        public BlogResponse getBlogBySlug(String slug) {
                Blog blog = blogRepository.findBySlug(slug)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND,
                                                "Blog not found with slug: " + slug));
                return blogMapper.toBlogResponse(blog);
        }

        @Override
        public List<BlogResponse> getAllBlogs() {
                return blogRepository.findAll().stream()
                                .map(blogMapper::toBlogResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<BlogResponse> getBlogsByCategory(String categoryId) {
                BlogCategory category = categoryRepository.findById(categoryId)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                                                "Blog category not found with ID: " + categoryId));

                return blogRepository.findByCategory(category).stream()
                                .map(blogMapper::toBlogResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<BlogResponse> getBlogsByAuthor(String authorId) {
                User author = userRepository.findById(authorId)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,
                                                "User not found with ID: " + authorId));

                return blogRepository.findByAuthor(author).stream()
                                .map(blogMapper::toBlogResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<BlogResponse> getPublishedBlogs() {
                return blogRepository.findByPublishedTrue().stream()
                                .map(blogMapper::toBlogResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<BlogResponse> searchBlogs(String keyword) {
                return blogRepository.search(keyword).stream()
                                .map(blogMapper::toBlogResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public BlogResponse updateBlog(String id, BlogCreateRequest request) {
                Blog blog = blogRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND,
                                                "Blog not found with ID: " + id));

                BlogCategory category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                                                "Blog category not found with ID: " + request.getCategoryId()));

                blogMapper.updateBlogFromRequest(request, blog);
                blog.setCategory(category);

                // Update slug if title has changed
                if (!blog.getTitle().equals(request.getTitle())) {
                        blog.setSlug(SlugUtil.generateSlug(request.getTitle()));
                }

                blog.setUpdatedAt(LocalDateTime.now());
                Blog updatedBlog = blogRepository.save(blog);
                return blogMapper.toBlogResponse(updatedBlog);
        }

        @Override
        public BlogResponse publishBlog(String id) {
                Blog blog = blogRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND,
                                                "Blog not found with ID: " + id));

                blog.setPublished(true);
                blog.setPublishedAt(LocalDateTime.now());
                blog.setUpdatedAt(LocalDateTime.now());

                Blog publishedBlog = blogRepository.save(blog);
                return blogMapper.toBlogResponse(publishedBlog);
        }

        @Override
        public void deleteBlog(String id) {
                Blog blog = blogRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.BLOG_NOT_FOUND,
                                                "Blog not found with ID: " + id));

                blogRepository.delete(blog);
        }
}