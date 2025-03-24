# Hướng dẫn thiết lập dự án Beautiful Care API

## 1. Yêu cầu hệ thống

- Java Development Kit (JDK) 17 hoặc cao hơn
- Maven 3.6 hoặc cao hơn
- MySQL 8.0 hoặc cao hơn
- IDE hỗ trợ Java (IntelliJ IDEA, Eclipse, VS Code,...)

## 2. Thiết lập cơ sở dữ liệu

1. Tạo cơ sở dữ liệu MySQL với tên `beautiful_care`:

```sql
CREATE DATABASE beautiful_care CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Tạo người dùng MySQL (tuỳ chọn) hoặc sử dụng tài khoản `root`:

```sql
CREATE USER 'beautiful_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON beautiful_care.* TO 'beautiful_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Clone và cấu hình dự án

1. Clone repository từ GitHub:

```shell
git clone https://github.com/your-org/beautiful-care-api.git
cd beautiful-care-api
```

2. Cấu hình kết nối cơ sở dữ liệu trong `src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/beautiful_care?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true
    username: root  # hoặc beautiful_user nếu bạn tạo người dùng riêng
    password: root  # thay đổi thành mật khẩu của bạn
```

3. Cấu hình JWT trong `src/main/resources/application.yaml`:

```yaml
jwt:
  signerKey: "LGeKsGSd24VeML6rG6EiNGDDBUBDpzR5pkXdT/piWaXmEh8qrvsihcqnmm/NW9ou"
  expiration: 86400000  # 24 giờ
```

QUAN TRỌNG: Trong môi trường sản xuất, hãy thay đổi khóa bí mật này thành một giá trị an toàn và duy nhất.

## 4. Thiết lập các thành phần JWT

Đảm bảo rằng bạn có các thành phần sau đây:

1. Thêm các dependency JWT trong `pom.xml`:

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

2. Tạo lớp `JwtConfig` trong package `com.dailycodework.beautifulcare.config`:

```java
package com.dailycodework.beautifulcare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

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

3. Cấu hình `SecurityConfig` với JWT:

```java
package com.dailycodework.beautifulcare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                // Các URL công khai
                .requestMatchers("/api/v1/users/auth/**", "/swagger-ui/**", "/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }
}
```

## 5. Biên dịch và chạy

1. Biên dịch dự án:

```shell
mvn clean package
```

2. Chạy ứng dụng:

```shell
java -jar target/beautiful-care-0.0.1-SNAPSHOT.jar
```

Hoặc sử dụng Maven Spring Boot plugin:

```shell
mvn spring-boot:run
```

3. Truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui.html
```

## 6. Khắc phục sự cố phổ biến

### Lỗi "JwtDecoder Bean Not Found"

**Triệu chứng:**
```
APPLICATION FAILED TO START
Parameter 0 of method setFilterChains in WebSecurityConfiguration required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder' that could not be found.
```

**Giải pháp:**
1. Kiểm tra xem bạn đã thêm dependency `spring-boot-starter-oauth2-resource-server` chưa
2. Đảm bảo lớp `JwtConfig` đã định nghĩa đúng bean `JwtDecoder`
3. Kiểm tra file `application.yaml` có chứa cấu hình `jwt.signerKey` chưa

### Lỗi cơ sở dữ liệu

**Triệu chứng:**
```
Communications link failure / Unable to connect to database
```

**Giải pháp:**
1. Kiểm tra xem MySQL đang chạy không
2. Kiểm tra thông tin kết nối (URL, username, password) trong `application.yaml`
3. Đảm bảo tên cơ sở dữ liệu chính xác và người dùng có đủ quyền

### Lỗi xác thực JWT

**Triệu chứng:**
```
Invalid JWT signature
```

**Giải pháp:**
1. Đảm bảo thuật toán trong `JwtDecoder` (HS512) khớp với thuật toán được sử dụng để tạo token
2. Kiểm tra khóa bí mật trong file cấu hình

## 7. Tài khoản mặc định

Ứng dụng đã được thiết lập với các tài khoản mặc định sau:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| specialist | specialist123 | SPECIALIST |
| customer | customer123 | CUSTOMER |
| content | content123 | CONTENT_CREATOR |

## 8. Tài liệu tham khảo

- [Hướng dẫn cấu hình JWT](./jwt-configuration.md)
- [Hướng dẫn xác thực với Swagger UI](./swagger-auth-guide.md)
- [Tài liệu API](./api-documentation.md) 