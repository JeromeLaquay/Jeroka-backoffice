FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/kafka-contracts/pom.xml microservices/kafka-contracts/pom.xml
COPY microservices/kafka-contracts/src microservices/kafka-contracts/src
RUN mvn -q -B -DskipTests install -f microservices/kafka-contracts/pom.xml
COPY microservices/audit-service/pom.xml microservices/audit-service/pom.xml
COPY microservices/audit-service/src microservices/audit-service/src
RUN mvn -q -B -DskipTests package -f microservices/audit-service/pom.xml
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/audit-service/target/*.jar app.jar
EXPOSE 3012
HEALTHCHECK --interval=30s --timeout=5s --start-period=35s --retries=3 CMD wget -qO- http://localhost:3012/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
