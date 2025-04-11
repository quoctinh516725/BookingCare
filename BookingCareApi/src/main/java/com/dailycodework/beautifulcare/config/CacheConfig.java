package com.dailycodework.beautifulcare.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for application caching
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Creates and configures the cache manager
     * @return Configured cache manager
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            "userDetails",     // For UserDetailsService
            "userById",        // For getUserById
            "allUsers",        // For getAllUsers
            "usersByRole",     // For getUsersByRole
            "popularServices", // For popular services
            "adminStats"       // For admin dashboard statistics
        );
        
        return cacheManager;
    }
} 