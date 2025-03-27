package com.dailycodework.beautifulcare.mapper.base;

import com.dailycodework.beautifulcare.dto.response.base.BaseResponse;
import com.dailycodework.beautifulcare.entity.base.BaseEntity;

/**
 * Interface cơ sở cho các mapper.
 * Định nghĩa các phương thức chung cần thiết cho việc chuyển đổi entity và DTO.
 *
 * @param <E> Entity kế thừa từ BaseEntity
 * @param <R> Response DTO kế thừa từ BaseResponse
 */
public interface BaseMapper<E extends BaseEntity, R extends BaseResponse> {

    /**
     * Chuyển đổi từ entity sang response DTO.
     *
     * @param entity Entity cần chuyển đổi
     * @return Response DTO tương ứng
     */
    R toResponse(E entity);

    /**
     * Map các trường cơ bản từ entity sang response DTO.
     * (id, createdAt, updatedAt)
     *
     * @param entity   Entity nguồn
     * @param response Response DTO đích
     */
    default void mapBaseFields(E entity, R response) {
        if (entity == null || response == null) {
            return;
        }

        response.setId(entity.getId());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
    }
}