# Cấu hình JWT trong Beautiful Care API

## Giới thiệu

Beautiful Care API sử dụng JWT (JSON Web Token) cho việc xác thực người dùng. Tài liệu này mô tả cách cấu hình và sử dụng JWT trong hệ thống, cũng như cách khắc phục các lỗi thường gặp.

## Các thành phần chính

### 1. SecurityConfig

Lớp `SecurityConfig` cấu hình bảo mật cho ứng dụng, bao gồm việc sử dụng JWT như một phương tiện xác thực:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Các cấu hình khác...
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
```

Cấu hình này sử dụng `oauth2ResourceServer().jwt()` để chỉ định rằng ứng dụng là một resource server sử dụng JWT.

### 2. JwtConfig

Lớp `JwtConfig` cung cấp một bean `JwtDecoder` để giải mã và xác thực JWT:

```java
@Configuration
public class JwtConfig {
    @Value("${jwt.signerKey}")
    private String jwtSignerKey;

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = jwtSignerKey.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA512");
        
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }
}
```

Lưu ý rằng thuật toán (HS512) phải khớp với thuật toán được sử dụng khi tạo token.

### 3. AuthenticationService

Lớp `AuthenticationService` chịu trách nhiệm tạo và xác thực JWT:

```java
@Service
public class AuthenticationService {
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY = "";

    // Phương thức xác thực token
    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(request.getToken());
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        
        boolean valid = signedJWT.verify(verifier);
        // Xử lý và trả về kết quả...
    }

    // Phương thức tạo token
    private String createToken(User user) throws JOSEException {
        JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());
        
        // Tạo JWT Claims với thông tin người dùng
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                // Các claims khác...
                .build();

        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claimsSet);
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }
}
```

## Cấu hình trong application.yaml

```yaml
jwt:
  signerKey: "LGeKsGSd24VeML6rG6EiNGDDBUBDpzR5pkXdT/piWaXmEh8qrvsihcqnmm/NW9ou"
  expiration: 86400000 # 24 giờ
```

- `jwt.signerKey`: Khóa bí mật dùng để ký và xác thực JWT
- `jwt.expiration`: Thời gian sống của token tính bằng mili giây

## Các thư viện cần thiết

Để sử dụng JWT, bạn cần các thư viện sau trong pom.xml:

```xml
<!-- OAuth2 Resource Server -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

<!-- Nimbus JOSE JWT -->
<dependency>
    <groupId>com.nimbusds</groupId>
    <artifactId>nimbus-jose-jwt</artifactId>
    <version>9.37.3</version>
</dependency>
```

## Lỗi thường gặp và cách khắc phục

### 1. Lỗi "JwtDecoder Bean Not Found"

**Triệu chứng:** 
```
APPLICATION FAILED TO START
Parameter 0 of method setFilterChains in WebSecurityConfiguration required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder' that could not be found.
```

**Nguyên nhân:**
Khi cấu hình `oauth2ResourceServer().jwt()` trong `SecurityConfig`, Spring Security yêu cầu một bean `JwtDecoder` để giải mã JWT.

**Giải pháp:**
- Thêm dependency `spring-boot-starter-oauth2-resource-server` vào pom.xml
- Tạo một bean `JwtDecoder` trong cấu hình ứng dụng
- Đảm bảo khóa bí mật được cấu hình đúng trong application.yaml

### 2. Lỗi "Invalid JWT Signature"

**Triệu chứng:**
```
Invalid JWT signature
```

**Nguyên nhân:**
- Thuật toán ký trong JWT không khớp với thuật toán được cấu hình trong `JwtDecoder`
- Khóa bí mật không khớp giữa việc tạo JWT và xác thực JWT

**Giải pháp:**
- Đảm bảo `JwtDecoder` và `AuthenticationService` sử dụng cùng một thuật toán (ví dụ: HS512)
- Kiểm tra xem cả hai đều sử dụng cùng một khóa bí mật từ cấu hình

### 3. Lỗi "JWT Expired"

**Triệu chứng:**
```
JWT expired at...
```

**Nguyên nhân:**
Token JWT đã hết hạn theo thời gian được chỉ định trong claim `exp`.

**Giải pháp:**
- Cấu hình thời gian hết hạn lâu hơn trong `application.yaml`
- Triển khai cơ chế refresh token để cấp token mới khi token cũ hết hạn

## Bảo mật và thực tiễn tốt nhất

1. **Sử dụng khóa bí mật đủ mạnh**: Khóa bí mật nên có ít nhất 256 bit và được tạo ngẫu nhiên
2. **Thiết lập thời gian hết hạn hợp lý**: Thời gian hết hạn nên ngắn cho token truy cập (ví dụ: 1 giờ)
3. **Sử dụng HTTPS**: Luôn truyền JWT qua kết nối HTTPS để tránh bị đánh cắp
4. **Xác thực phạm vi**: Xác minh rằng token có các phạm vi/quyền cần thiết cho hành động được yêu cầu
5. **Lưu trữ an toàn khóa bí mật**: Không lưu khóa bí mật trong mã nguồn, sử dụng biến môi trường hoặc cơ chế lưu trữ bí mật 