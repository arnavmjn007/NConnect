# Stage 1: build the jar using Maven + JDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: run the jar using a lightweight JRE-only image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/core-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
