package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.response.BlogCategoryResponse;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BlogCategoryMapper {
    BlogCategoryResponse toBlogCategoryResponse(BlogCategory category);
}