## Build depuis la racine du monorepo : docker compose build dashboard-bff

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/dashboard-bff/pom.xml microservices/dashboard-bff/pom.xml
COPY microservices/dashboard-bff/src microservices/dashboard-bff/src
RUN mvn -q -B -DskipTests package -f microservices/dashboard-bff/pom.xml

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/dashboard-bff/target/*.jar app.jar
EXPOSE 3013
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 CMD wget -qO- http://localhost:3013/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
