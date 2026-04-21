FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/auth-service/pom.xml microservices/auth-service/pom.xml
COPY microservices/auth-service/src microservices/auth-service/src
RUN mvn -q -B -DskipTests package -f microservices/auth-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/auth-service/target/*.jar app.jar
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3004/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
