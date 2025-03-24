package com.dailycodework.beautifulcare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationConverter jwtAuthenticationConverter;

        public SecurityConfig(JwtAuthenticationConverter jwtAuthenticationConverter) {
                this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(authorize -> authorize
                                                // Swagger UI và OpenAPI endpoints
                                                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                                                // Auth endpoints
                                                .requestMatchers("/api/v1/users/auth/**").permitAll()
                                                // Public GET endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/v1/services/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/blogs/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/service-categories/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/blog-categories/**")
                                                .permitAll()

                                                // ADMIN endpoints
                                                .requestMatchers(HttpMethod.POST, "/api/v1/services/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/services/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/services/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.POST, "/api/v1/service-categories/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/service-categories/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/service-categories/**")
                                                .hasRole("ADMIN")

                                                // CONTENT_CREATOR endpoints
                                                .requestMatchers(HttpMethod.POST, "/api/v1/blogs/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/blogs/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/blogs/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")
                                                .requestMatchers(HttpMethod.POST, "/api/v1/blog-categories/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/blog-categories/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/blog-categories/**")
                                                .hasAnyRole("ADMIN", "CONTENT_CREATOR")

                                                // SPECIALIST endpoints
                                                .requestMatchers("/api/v1/specialists/me/**")
                                                .hasAnyRole("ADMIN", "SPECIALIST")

                                                // Authenticated endpoints
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                                                jwtAuthenticationConverter)));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
                configuration.setExposedHeaders(List.of("Authorization"));
                configuration.setAllowCredentials(false);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
