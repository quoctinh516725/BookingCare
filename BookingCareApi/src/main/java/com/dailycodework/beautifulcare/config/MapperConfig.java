package com.dailycodework.beautifulcare.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "com.dailycodework.beautifulcare.mapper")
public class MapperConfig {
    // Cấu hình này đảm bảo tất cả các Mapper được quét và đăng ký như Spring beans
}   