package com.dailycodework.beautifulcare.config;

import com.dailycodework.beautifulcare.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final UserDetailsService userDetailsService;

        @Value("${spring.profiles.active:default}")
        private String activeProfile;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                // Kiểm tra xem đang ở môi trường test hay không
                boolean isTestEnvironment = activeProfile.equals("test");

                if (isTestEnvironment) {
                        // Cấu hình cho môi trường test
                        http
                                        .csrf(csrf -> csrf.disable())
                                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                        .authorizeHttpRequests(auth -> auth
                                                        .anyRequest().permitAll())
                                        .sessionManagement(session -> session
                                                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
                } else {
                        // Cấu hình bảo mật thực tế - cho phép truy cập không cần xác thực đến các API user
                        http
                                        .csrf(csrf -> csrf.disable())
                                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                        .authorizeHttpRequests(auth -> auth
                                                        .requestMatchers("/api/v1/auth/**").permitAll()
                                                        .requestMatchers("/api/v1/services/**").permitAll()
                                                        .requestMatchers("/api/v1/users/**").permitAll()
                                                        .requestMatchers("/swagger-ui/**", "/api-docs/**",
                                                                        "/v3/api-docs/**")
                                                        .permitAll()
                                                        .anyRequest().authenticated())
                                        .sessionManagement(session -> session
                                                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                        .authenticationProvider(authenticationProvider())
                                        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                }

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Chỉ cho phép một origin
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList(
                    "Authorization",
                    "Content-Type",
                    "X-Requested-With",
                    "Accept",
                    "Origin",
                    "Access-Control-Request-Method",
                    "Access-Control-Request-Headers"
                ));
                configuration.setExposedHeaders(Arrays.asList(
                    "Authorization",
                    "Access-Control-Allow-Origin",
                    "Access-Control-Allow-Credentials",
                    "Set-Cookie"
                ));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
