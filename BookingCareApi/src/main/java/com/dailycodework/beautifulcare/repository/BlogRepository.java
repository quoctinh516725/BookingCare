package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Blog;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, String> {
    List<Blog> findByCategory(BlogCategory category);

    List<Blog> findByAuthor(User author);

    List<Blog> findByPublishedTrue();

    Optional<Blog> findBySlug(String slug);

    @Query("SELECT b FROM Blog b WHERE " +
            "b.title LIKE %:keyword% OR " +
            "b.content LIKE %:keyword%")
    List<Blog> search(String keyword);
}