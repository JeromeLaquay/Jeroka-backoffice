package fr.jeroka.iadocs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class IaDocsEventsWorkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(IaDocsEventsWorkerApplication.class, args);
    }
}
