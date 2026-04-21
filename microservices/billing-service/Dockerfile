## Build depuis la racine du monorepo : docker compose build billing-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/billing-service/pom.xml microservices/billing-service/pom.xml
COPY microservices/billing-service/src microservices/billing-service/src
RUN mvn -q -B -DskipTests package -f microservices/billing-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/billing-service/target/*.jar app.jar
EXPOSE 3008
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 CMD wget -qO- http://localhost:3008/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
