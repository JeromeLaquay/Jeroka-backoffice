## Build depuis la racine du monorepo : docker compose build organization-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/organization-service/pom.xml microservices/organization-service/pom.xml
COPY microservices/organization-service/src microservices/organization-service/src
RUN mvn -q -B -DskipTests package -f microservices/organization-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/organization-service/target/*.jar app.jar
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://localhost:3005/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
