# -- Estágio 1: Build --
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copia o Maven Wrapper e o pom.xml primeiro (para cache de dependências)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dá permissão de execução ao wrapper e baixa as dependências
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copia o código-fonte e faz o build
COPY src src
RUN ./mvnw package -DskipTests -B

# -- Estágio 2: Runtime --
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia o JAR gerado no estágio de build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
