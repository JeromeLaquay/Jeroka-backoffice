## Build depuis la racine du monorepo : docker compose build content-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/content-service/pom.xml microservices/content-service/pom.xml
COPY microservices/content-service/src microservices/content-service/src
RUN mvn -q -B -DskipTests package -f microservices/content-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/content-service/target/*.jar app.jar
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 CMD wget -qO- http://localhost:3010/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
