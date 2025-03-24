package com.dailycodework.beautifulcare.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme.In;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Beautiful Care API", version = "1.0", description = "REST API cho ứng dụng quản lý salon làm đẹp", contact = @Contact(name = "Beautiful Care Team", email = "support@beautifulcare.com", url = "https://beautifulcare.com"), license = @License(name = "MIT License", url = "https://opensource.org/licenses/MIT")), servers = {
                @Server(url = "http://localhost:8080", description = "Local Development Server")
}, security = {
                @SecurityRequirement(name = "Bearer Authentication")
})
@SecurityScheme(name = "Bearer Authentication", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", scheme = "bearer")
public class OpenApiConfig {

        @Bean
        public OpenAPI customizeOpenAPI() {
                return new OpenAPI()
                                .components(new Components()
                                                .addSecuritySchemes("Bearer Authentication",
                                                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                                                                .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")
                                                                                .in(In.HEADER)
                                                                                .name("Authorization")));
        }
}