## Build depuis la racine du monorepo : docker compose build crm-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/crm-service/pom.xml microservices/crm-service/pom.xml
COPY microservices/crm-service/src microservices/crm-service/src
RUN mvn -q -B -DskipTests package -f microservices/crm-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/crm-service/target/*.jar app.jar
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://localhost:3006/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
