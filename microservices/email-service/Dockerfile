FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /repo
COPY microservices/kafka-contracts/pom.xml microservices/kafka-contracts/pom.xml
COPY microservices/kafka-contracts/src microservices/kafka-contracts/src
RUN mvn -q -B -DskipTests install -f microservices/kafka-contracts/pom.xml
COPY microservices/jeroka-jwt-resource/pom.xml microservices/jeroka-jwt-resource/pom.xml
COPY microservices/jeroka-jwt-resource/src microservices/jeroka-jwt-resource/src
RUN mvn -q -B -DskipTests install -f microservices/jeroka-jwt-resource/pom.xml
COPY microservices/email-service/pom.xml microservices/email-service/pom.xml
COPY microservices/email-service/src microservices/email-service/src
RUN mvn -q -B -DskipTests package -f microservices/email-service/pom.xml
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /repo/microservices/email-service/target/*.jar app.jar
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
