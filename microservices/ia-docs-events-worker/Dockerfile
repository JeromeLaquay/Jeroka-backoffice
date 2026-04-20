FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/kafka-contracts/pom.xml microservices/kafka-contracts/pom.xml
COPY microservices/kafka-contracts/src microservices/kafka-contracts/src
RUN mvn -q -B -DskipTests install -f microservices/kafka-contracts/pom.xml
COPY microservices/ia-docs-events-worker/pom.xml microservices/ia-docs-events-worker/pom.xml
COPY microservices/ia-docs-events-worker/src microservices/ia-docs-events-worker/src
RUN mvn -q -B -DskipTests package -f microservices/ia-docs-events-worker/pom.xml
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/ia-docs-events-worker/target/*.jar app.jar
EXPOSE 3016
ENTRYPOINT ["java", "-jar", "app.jar"]
