FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Tải trước dependencies để tận dụng Docker cache
RUN mvn dependency:go-offline

COPY src ./src
# Build ứng dụng với Maven
RUN mvn clean package -DskipTests

# Tạo image chạy ứng dụng
FROM eclipse-temurin:17-jre
WORKDIR /app

# Cài đặt curl cho healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Tạo thư mục uploads để lưu file ảnh
RUN mkdir -p /app/uploads/images && chmod -R 777 /app/uploads

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Command để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"] 