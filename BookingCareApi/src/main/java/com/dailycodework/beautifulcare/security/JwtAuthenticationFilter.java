package com.dailycodework.beautifulcare.security;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.JwtService;
import com.dailycodework.beautifulcare.service.PermissionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PermissionService permissionService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Kiểm tra quyền truy cập API
                String requestURI = request.getRequestURI();
                String method = request.getMethod();
                
                // Log thông tin request
                log.debug("Checking permission for request - URI: {}, Method: {}, User: {}", 
                        requestURI, method, username);
                
                // Kiểm tra quyền truy cập
                boolean hasPermission = true;
                if (requestURI.startsWith("/api/v1/users")) {
                    if (method.equals("POST")) {
                        hasPermission = permissionService.hasPermission(username, "user:create");
                        log.debug("Checking user:create permission for user: {}, result: {}", username, hasPermission);
                    } else if (method.equals("PUT") || method.equals("DELETE")) {
                        hasPermission = permissionService.hasPermission(username, "user:update");
                        log.debug("Checking user:update permission for user: {}, result: {}", username, hasPermission);
                    } else if (method.equals("GET")) {
                        // Kiểm tra nếu user đang truy cập thông tin của chính mình
                        String requestedUserId = extractUserIdFromUrl(requestURI);
                        
                        if (requestedUserId != null) {
                            // Cố gắng lấy ID của người dùng hiện tại
                            Optional<User> currentUser = userRepository.findByUsername(username);
                            
                            if (currentUser.isPresent() && requestedUserId.equals(currentUser.get().getId().toString())) {
                                // User đang truy cập thông tin của chính mình, cho phép không cần kiểm tra quyền
                                log.debug("User {} is accessing their own profile, granting access without permission check", username);
                                hasPermission = true;
                            } else {
                                // User đang truy cập thông tin của người khác, kiểm tra quyền user:view
                                hasPermission = permissionService.hasPermission(username, "user:view");
                                log.debug("User {} is accessing another user's profile, checking user:view permission: {}", 
                                         username, hasPermission);
                            }
                        } else {
                            // Truy cập danh sách người dùng hoặc endpoint khác, kiểm tra quyền user:view
                            hasPermission = permissionService.hasPermission(username, "user:view");
                            log.debug("Checking user:view permission for user: {}, result: {}", username, hasPermission);
                        }
                    }
                }
                
                if (!hasPermission) {
                    log.warn("Access denied - User: {}, URI: {}, Method: {}", username, requestURI, method);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
    
    /**
     * Trích xuất ID người dùng từ URL dạng /api/v1/users/{id}
     * @param url Đường dẫn URL
     * @return userId nếu có, null nếu không tìm thấy
     */
    private String extractUserIdFromUrl(String url) {
        // Pattern để trích xuất UUID từ đường dẫn
        Pattern pattern = Pattern.compile("/api/v1/users/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})");
        Matcher matcher = pattern.matcher(url);
        
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        return null;
    }
}