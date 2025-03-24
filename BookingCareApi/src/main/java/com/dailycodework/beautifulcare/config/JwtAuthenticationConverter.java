package com.dailycodework.beautifulcare.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Converter để biến đổi JWT thành Authentication Token với các quyền truy cập
 * đúng dựa trên claim "role" trong JWT
 */
@Component
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> defaultAuthorities = defaultConverter.convert(jwt);

        // Trích xuất role từ JWT
        String role = jwt.getClaim("role");

        // Tạo danh sách quyền từ role
        Collection<GrantedAuthority> roleAuthorities = new ArrayList<>();
        if (role != null && !role.isEmpty()) {
            // Thêm quyền dạng ROLE_XXX cho Spring Security
            roleAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role));

            // Thêm quyền dạng đơn giản XXX để hỗ trợ cả hasRole và hasAuthority
            roleAuthorities.add(new SimpleGrantedAuthority(role));
        }

        // Gộp quyền mặc định với quyền từ role
        Collection<GrantedAuthority> authorities = Stream.concat(
                defaultAuthorities.stream(),
                roleAuthorities.stream()).collect(Collectors.toList());

        // Lưu userId vào token để sử dụng cho @securityService
        String userId = jwt.getClaim("userId");

        // Tạo JwtAuthenticationToken với đầy đủ thông tin
        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }
}