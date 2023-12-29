package com.leisa.microservice.list;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.leisa.microservice.list.model")
public class ListApplication {
    public static void main(String[] args) {
        SpringApplication.run(ListApplication.class, args);
    }
}