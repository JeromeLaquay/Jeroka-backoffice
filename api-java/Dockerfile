## Image multi-stage pour l'API Java (Spring Boot 3 / Java 21)

# Étape de build : compilation Maven
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier uniquement les fichiers de build pour profiter du cache Docker
COPY pom.xml .
COPY src ./src

# Construire le jar (tests ignorés en image Docker)
RUN mvn -q -DskipTests package

# Étape de runtime : JRE léger
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copier le jar généré
COPY --from=build /app/target/*.jar app.jar

# Port HTTP configuré dans application.yml
EXPOSE 3002

ENV JAVA_OPTS=""

# Healthcheck simple sur /health (optionnel, même endpoint que l'API Node)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

# Lancement de l'application
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]

