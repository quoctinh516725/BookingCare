package com.dailycodework.beautifulcare.security;

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

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PermissionService permissionService;

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
                        hasPermission = permissionService.hasPermission(username, "user:view");
                        log.debug("Checking user:view permission for user: {}, result: {}", username, hasPermission);
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
}