package com.hrms.modulith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.modulith.Modulithic;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Modulithic(
    sharedModules = {"common"},
    useFullyQualifiedModuleNames = false
)
@SpringBootApplication
@EnableScheduling
@EnableAsync
@ConfigurationPropertiesScan
public class HrmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrmsApplication.class, args);
    }
}
