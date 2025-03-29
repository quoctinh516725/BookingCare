package com.dailycodework.beautifulcare;

import com.dailycodework.beautifulcare.config.EnableSimpleMode;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableSimpleMode
public class BeautifulCareApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeautifulCareApplication.class, args);
	}

}
