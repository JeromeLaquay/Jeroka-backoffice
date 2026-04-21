package fr.jeroka.email.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class EmailEventsWorkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmailEventsWorkerApplication.class, args);
    }
}
