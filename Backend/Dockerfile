# Use official Maven image to build the app
FROM maven:3.9.4-eclipse-temurin-17 AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml and download dependencies (this step is cached if pom.xml unchanged)
COPY pom.xml .

RUN mvn dependency:go-offline -B

# Copy all source code
COPY src ./src

# Package the application (skip tests to speed up)
RUN mvn clean package -DskipTests

# Use a minimal Java runtime image to run the app
FROM eclipse-temurin:17-jre-alpine

# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your app will run on (matches application.properties config)
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app.jar"]
