## Build depuis la racine du monorepo : docker compose build docs-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/docs-service/pom.xml microservices/docs-service/pom.xml
COPY microservices/docs-service/src microservices/docs-service/src
RUN mvn -q -B -DskipTests package -f microservices/docs-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/docs-service/target/*.jar app.jar
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 CMD wget -qO- http://localhost:3011/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
