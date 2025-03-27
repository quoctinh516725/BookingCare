package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.RefreshToken;
import com.dailycodework.beautifulcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUser(User user);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.isValid = false WHERE r.user.email = :email")
    void invalidateAllUserTokens(String email);
}