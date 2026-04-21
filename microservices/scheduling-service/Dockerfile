## Build depuis la racine du monorepo : docker compose build scheduling-service

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/scheduling-service/pom.xml microservices/scheduling-service/pom.xml
COPY microservices/scheduling-service/src microservices/scheduling-service/src
RUN mvn -q -B -DskipTests package -f microservices/scheduling-service/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/scheduling-service/target/*.jar app.jar
EXPOSE 3009
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 CMD wget -qO- http://localhost:3009/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
