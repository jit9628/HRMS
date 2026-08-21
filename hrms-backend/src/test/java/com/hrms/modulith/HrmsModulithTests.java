package com.hrms.modulith;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

class HrmsModulithTests {

    ApplicationModules modules = ApplicationModules.of(HrmsApplication.class);

    @Test
    void verifiesModularStructure() {
        modules.verify();
    }

    // @Test
    // void createModuleDocumentation() {
    //     new Documenter(modules)
    //             .writeDocumentation()
    //             .writeModulesAsPlantUml();
    // }
}
