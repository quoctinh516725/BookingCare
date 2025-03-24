package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.BlogCreateRequest;
import com.dailycodework.beautifulcare.dto.response.BlogResponse;
import com.dailycodework.beautifulcare.entity.Blog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = { BlogCategoryMapper.class, UserMapper.class })
public interface BlogMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    Blog toBlog(BlogCreateRequest request);

    BlogResponse toBlogResponse(Blog blog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    void updateBlogFromRequest(BlogCreateRequest request, @MappingTarget Blog blog);
}