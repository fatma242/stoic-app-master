# --- 1) BUILD STAGE ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# copy only what’s needed for Maven to resolve dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# now copy sources and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- 2) RUNTIME STAGE ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# copy the fat-jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8100
ENTRYPOINT ["java","-jar","app.jar"]